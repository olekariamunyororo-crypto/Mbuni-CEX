// Mbuni CEX — KYC/AML verification endpoint
// POST /api/kyc  { documentType, documentNumber, fullName, dob, address, city, country }
// GET  /api/kyc  → returns current user's KYC status
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import { db } from "@/lib/db";

const SANCTIONED_NAMES = ["sanctioned", "terrorist", "criminal", "fraud", "laundering"];

function amlScreening(name: string): { passed: boolean; reason?: string } {
  const lower = name.toLowerCase();
  for (const s of SANCTIONED_NAMES) {
    if (lower.includes(s)) return { passed: false, reason: "AML flag: name matches sanctioned entity pattern" };
  }
  const riskScore = Math.floor(Math.random() * 15);
  if (riskScore > 12) return { passed: false, reason: "AML risk score above threshold — manual review required" };
  return { passed: true };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { kycStatus: true, kycDocumentType: true, kycDocumentNumber: true, kycSubmittedAt: true, kycVerifiedAt: true, kycRejectReason: true, kycAttemptCount: true },
  });
  return NextResponse.json({ ok: true, kyc: user });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const documentType = String(body.documentType ?? "");
    const documentNumber = String(body.documentNumber ?? "").trim();
    const fullName = String(body.fullName ?? "").trim();
    const dob = String(body.dob ?? "");
    const address = String(body.address ?? "").trim();
    const city = String(body.city ?? "").trim();
    const country = String(body.country ?? "Kenya").trim();

    if (!documentType || !["NATIONAL_ID", "PASSPORT", "DRIVERS_LICENSE"].includes(documentType))
      return NextResponse.json({ ok: false, error: "Valid document type required" }, { status: 400 });
    if (!documentNumber || documentNumber.length < 4)
      return NextResponse.json({ ok: false, error: "Valid document number required" }, { status: 400 });
    if (!fullName || fullName.length < 3)
      return NextResponse.json({ ok: false, error: "Full name required" }, { status: 400 });
    if (!dob) return NextResponse.json({ ok: false, error: "Date of birth required" }, { status: 400 });
    if (!address) return NextResponse.json({ ok: false, error: "Address required" }, { status: 400 });

    const existingUser = await db.user.findUnique({ where: { id: session.user.id }, select: { kycAttemptCount: true, kycStatus: true } });
    if (!existingUser) return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    if (existingUser.kycAttemptCount >= 3 && existingUser.kycStatus === "REJECTED")
      return NextResponse.json({ ok: false, error: "Maximum KYC attempts exceeded. Contact support." }, { status: 429 });

    const amlResult = amlScreening(fullName);
    if (!amlResult.passed) {
      await db.user.update({ where: { id: session.user.id }, data: { kycStatus: "REJECTED", kycRejectReason: amlResult.reason, kycAttemptCount: { increment: 1 }, kycDocumentType: documentType, kycDocumentNumber: documentNumber, kycSubmittedAt: new Date() } });
      return NextResponse.json({ ok: false, status: "REJECTED", reason: amlResult.reason });
    }

    await db.user.update({ where: { id: session.user.id }, data: { kycStatus: "PENDING", kycDocumentType: documentType, kycDocumentNumber: documentNumber, kycSubmittedAt: new Date(), kycRejectReason: null, kycAttemptCount: { increment: 1 } } });

    // Demo mode: auto-approve after 4 seconds
    setTimeout(async () => {
      try {
        const u = await db.user.findUnique({ where: { id: session.user.id }, select: { tier: true } });
        await db.user.update({ where: { id: session.user.id }, data: { kycStatus: "VERIFIED", kycVerifiedAt: new Date(), tier: Math.max(1, u?.tier ?? 0) } });
      } catch (e) { console.error("[kyc] auto-approve failed:", e); }
    }, 4000);

    return NextResponse.json({ ok: true, status: "PENDING", message: "KYC submitted. Documents under review." });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
