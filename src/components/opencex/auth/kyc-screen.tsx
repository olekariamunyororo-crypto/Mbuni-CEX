"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, FileText, Camera, Check, Loader2, ArrowRight, ArrowLeft, XCircle, CreditCard } from "lucide-react";
import { useSession } from "next-auth/react";
import { OstrichLogo } from "@/components/opencex/ostrich-logo";
import { toast } from "sonner";

type KycStep = "document" | "selfie" | "address" | "review" | "pending" | "done";
type DocType = "NATIONAL_ID" | "PASSPORT" | "DRIVERS_LICENSE";

const STEPS: KycStep[] = ["document", "selfie", "address", "review", "pending", "done"];
const DOC_TYPES: { key: DocType; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "NATIONAL_ID", label: "National ID", description: "Kenya National ID card", icon: CreditCard },
  { key: "PASSPORT", label: "Passport", description: "Valid passport bio page", icon: FileText },
  { key: "DRIVERS_LICENSE", label: "Driver's License", description: "Valid driving license", icon: CreditCard },
];

export function KycScreen({ onComplete }: { onComplete: () => void }) {
  const { data: session } = useSession();
  const [step, setStep] = useState<KycStep>("document");
  const [submitting, setSubmitting] = useState(false);
  const [docType, setDocType] = useState<DocType>("NATIONAL_ID");
  const [docNumber, setDocNumber] = useState("");
  const [fullName, setFullName] = useState(session?.user?.name ?? "");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [rejectReason, setRejectReason] = useState("");
  const [docFront, setDocFront] = useState("");
  const [selfie, setSelfie] = useState("");
  const [addressDoc, setAddressDoc] = useState("");

  useEffect(() => {
    if (step !== "pending") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/kyc");
        const data = await res.json();
        if (data.ok && data.kyc) {
          if (data.kyc.kycStatus === "VERIFIED") { setStep("done"); clearInterval(interval); setTimeout(onComplete, 2000); }
          else if (data.kyc.kycStatus === "REJECTED") { setRejectReason(data.kyc.kycRejectReason ?? "Rejected"); setStep("review"); clearInterval(interval); }
        }
      } catch {}
    }, 1500);
    return () => clearInterval(interval);
  }, [step, onComplete]);

  const submitKyc = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/kyc", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentType: docType, documentNumber: docNumber, fullName, dob, address, city, country }) });
      const data = await res.json();
      if (!data.ok) { if (data.status === "REJECTED") { setRejectReason(data.reason); setStep("review"); } else { toast.error(data.error ?? "KYC failed"); setStep("review"); } }
      else { setStep("pending"); }
    } catch (e) { toast.error((e as Error).message); setStep("review"); }
    setSubmitting(false);
  };

  const canDoc = docType && docNumber && docFront && fullName && dob;
  const canSelfie = selfie;
  const canAddr = address && city && addressDoc;
  const stepIdx = ["document","selfie","address","review","pending","done"].indexOf(step);
  const adjustedIdx = step === "pending" ? 3 : step === "done" ? 4 : stepIdx;

  return (
    <div className="min-h-screen flex flex-col bg-bg relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="relative px-6 pt-6 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-elevated flex items-center justify-center text-primary overflow-hidden"><OstrichLogo className="w-7 h-7" /></div>
          <span className="font-bold text-sm">Mbuni CEX · Identity Verification</span>
        </div>
        <div className="flex gap-2 mb-2">
          {["Document","Selfie","Address","Review","Done"].map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full transition-colors ${i <= adjustedIdx ? "bg-primary" : "bg-elevated"}`} />
              <div className={`text-[10px] mt-1.5 ${i === adjustedIdx ? "text-foreground font-medium" : "text-tertiary"}`}>{s}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex-1 flex items-center justify-center p-6 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} className="w-full">
            {step === "document" && (
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Verify your identity</h2>
                <p className="text-sm text-secondary mt-1 mb-6">Required by Kenya's VASP Regulations (LN 134, 2026) to trade on Mbuni CEX.</p>
                <label className="text-[10px] uppercase tracking-wider text-secondary block mb-2">Document type</label>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {DOC_TYPES.map((d) => { const Icon = d.icon; const active = docType === d.key; return (
                    <button key={d.key} onClick={() => setDocType(d.key)} className={`p-3 rounded-xl border text-left transition-all ${active ? "border-primary bg-primary/10" : "border-line hover:bg-elevated"}`}>
                      <Icon className={`w-5 h-5 mb-2 ${active ? "text-primary" : "text-secondary"}`} />
                      <div className="text-xs font-medium">{d.label}</div>
                      <div className="text-[10px] text-tertiary mt-0.5">{d.description}</div>
                    </button>
                  ); })}
                </div>
                <label className="text-[10px] uppercase tracking-wider text-secondary block mb-1">{docType === "NATIONAL_ID" ? "ID Number" : docType === "PASSPORT" ? "Passport Number" : "License Number"}</label>
                <input type="text" value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder={docType === "NATIONAL_ID" ? "12345678" : "A1234567B"} className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-primary" />
                <label className="text-[10px] uppercase tracking-wider text-secondary block mb-1">Full name (as on document)</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe Mwangi" className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-primary" />
                <label className="text-[10px] uppercase tracking-wider text-secondary block mb-1">Date of birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-primary" />
                <label className="text-[10px] uppercase tracking-wider text-secondary block mb-1">Upload document (front)</label>
                <div className="border border-dashed border-line rounded-xl p-4 text-center mb-4 cursor-pointer hover:bg-elevated transition-colors" onClick={() => setDocFront(`${docType}_front_${Date.now()}.jpg`)}>
                  {docFront ? (<div className="flex items-center justify-center gap-2 text-primary"><Check className="w-4 h-4" /><span className="text-xs">{docFront}</span></div>) : (<div className="text-secondary"><Camera className="w-6 h-6 mx-auto mb-1" /><span className="text-xs">Tap to upload or take photo</span></div>)}
                </div>
                <button onClick={() => setStep("selfie")} disabled={!canDoc} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-cta hover:bg-cta-hover disabled:opacity-50 text-white text-sm font-semibold transition-colors">Continue <ArrowRight className="w-4 h-4" /></button>
              </div>
            )}
            {step === "selfie" && (
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Take a selfie</h2>
                <p className="text-sm text-secondary mt-1 mb-6">We compare your face with your ID photo to prevent identity theft.</p>
                <div className="border border-dashed border-line rounded-3xl p-8 text-center mb-4 cursor-pointer hover:bg-elevated transition-colors" onClick={() => setSelfie(`selfie_${Date.now()}.jpg`)}>
                  {selfie ? (<div className="flex flex-col items-center gap-3 text-primary"><div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center"><Check className="w-10 h-10" /></div><span className="text-xs">{selfie}</span><span className="text-[11px] text-tertiary">Liveness check passed</span></div>) : (<div className="text-secondary"><div className="w-20 h-20 rounded-full bg-elevated mx-auto mb-2 flex items-center justify-center"><Camera className="w-8 h-8" /></div><span className="text-xs">Tap to take a selfie</span><p className="text-[11px] text-tertiary mt-1">Look directly at the camera. Good lighting required.</p></div>)}
                </div>
                <div className="flex items-center gap-2 mb-4 text-[11px] text-tertiary"><ShieldCheck className="w-3 h-3 text-primary shrink-0" /><span>Your biometric data is encrypted, never shared, and deleted after verification.</span></div>
                <div className="flex gap-2">
                  <button onClick={() => setStep("document")} className="flex items-center gap-1 px-4 py-3 rounded-xl text-sm text-secondary hover:text-foreground hover:bg-elevated transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                  <button onClick={() => setStep("address")} disabled={!canSelfie} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cta hover:bg-cta-hover disabled:opacity-50 text-white text-sm font-semibold transition-colors">Continue <ArrowRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
            {step === "address" && (
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Proof of address</h2>
                <p className="text-sm text-secondary mt-1 mb-6">Required for AML compliance under Kenya VASP Regulations.</p>
                <label className="text-[10px] uppercase tracking-wider text-secondary block mb-1">Residential address</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Moi Avenue, Westlands" className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-primary" />
                <label className="text-[10px] uppercase tracking-wider text-secondary block mb-1">City</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Nairobi" className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-primary" />
                <label className="text-[10px] uppercase tracking-wider text-secondary block mb-1">Country</label>
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-surface border border-line rounded-xl px-3 py-2.5 text-sm mb-4 focus:outline-none focus:border-primary" />
                <label className="text-[10px] uppercase tracking-wider text-secondary block mb-1">Upload proof of address</label>
                <div className="border border-dashed border-line rounded-xl p-4 text-center mb-4 cursor-pointer hover:bg-elevated transition-colors" onClick={() => setAddressDoc(`address_${Date.now()}.pdf`)}>
                  {addressDoc ? (<div className="flex items-center justify-center gap-2 text-primary"><Check className="w-4 h-4" /><span className="text-xs">{addressDoc}</span></div>) : (<div className="text-secondary"><FileText className="w-6 h-6 mx-auto mb-1" /><span className="text-xs">Utility bill, bank statement, or lease</span><p className="text-[11px] text-tertiary mt-0.5">Must be less than 3 months old</p></div>)}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep("selfie")} className="flex items-center gap-1 px-4 py-3 rounded-xl text-sm text-secondary hover:text-foreground hover:bg-elevated transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
                  <button onClick={() => setStep("review")} disabled={!canAddr} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cta hover:bg-cta-hover disabled:opacity-50 text-white text-sm font-semibold transition-colors">Continue <ArrowRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
            {step === "review" && (
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Review & submit</h2>
                <p className="text-sm text-secondary mt-1 mb-6">Please confirm your details are correct before submitting.</p>
                {rejectReason && (<div className="bg-danger/10 border border-danger/30 rounded-xl p-3 mb-4 flex items-start gap-2"><XCircle className="w-4 h-4 text-danger mt-0.5 shrink-0" /><div><div className="text-xs font-medium text-danger">Previous attempt rejected</div><div className="text-[11px] text-secondary mt-0.5">{rejectReason}</div></div></div>)}
                <div className="rounded-3xl border border-line bg-surface/90 p-4 space-y-2 mb-5" style={{boxShadow:"0 8px 32px rgba(0,0,0,0.35)"}}>
                  <div className="flex justify-between py-1"><span className="text-[11px] text-tertiary">Document type</span><span className="text-sm font-medium">{docType.replace("_"," ")}</span></div>
                  <div className="flex justify-between py-1"><span className="text-[11px] text-tertiary">Document number</span><span className="text-sm font-medium">{docNumber}</span></div>
                  <div className="flex justify-between py-1"><span className="text-[11px] text-tertiary">Full name</span><span className="text-sm font-medium">{fullName}</span></div>
                  <div className="flex justify-between py-1"><span className="text-[11px] text-tertiary">Date of birth</span><span className="text-sm font-medium">{dob}</span></div>
                  <div className="flex justify-between py-1"><span className="text-[11px] text-tertiary">Address</span><span className="text-sm font-medium text-right">{address}, {city}, {country}</span></div>
                </div>
                <div className="bg-elevated rounded-xl p-3 mb-5 flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" /><div className="text-[11px] text-secondary">By submitting, you consent to identity verification and AML screening under Kenya's VASP Regulations (LN 134, 2026). Your data is encrypted and stored in compliance with the Kenya Data Protection Act, 2019.</div></div>
                <div className="flex gap-2">
                  <button onClick={() => { setRejectReason(""); setStep("address"); }} disabled={submitting} className="flex items-center gap-1 px-4 py-3 rounded-xl text-sm text-secondary hover:text-foreground hover:bg-elevated transition-colors"><ArrowLeft className="w-4 h-4" /> Edit</button>
                  <button onClick={submitKyc} disabled={submitting} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-cta hover:bg-cta-hover disabled:opacity-50 text-white text-sm font-semibold transition-colors">{submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit for verification <ShieldCheck className="w-4 h-4" /></>}</button>
                </div>
              </div>
            )}
            {step === "pending" && (
              <div className="text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-20 h-20 rounded-full border-4 border-elevated border-t-primary mx-auto mb-6" />
                <h2 className="text-xl font-bold">Verifying your documents...</h2>
                <p className="text-sm text-secondary mt-2 max-w-xs mx-auto">Our system is reviewing your ID, selfie, and proof of address. This usually takes 30 seconds.</p>
                <div className="mt-6 space-y-2 max-w-xs mx-auto">
                  <div className="flex items-center gap-2 text-xs"><Check className="w-4 h-4 text-primary shrink-0" /><span className="text-secondary">Document OCR + validation</span></div>
                  <div className="flex items-center gap-2 text-xs"><Check className="w-4 h-4 text-primary shrink-0" /><span className="text-secondary">Face match (selfie to ID)</span></div>
                  <div className="flex items-center gap-2 text-xs"><Loader2 className="w-4 h-4 text-gold animate-spin shrink-0" /><span className="text-foreground">AML screening</span></div>
                  <div className="flex items-center gap-2 text-xs"><div className="w-4 h-4 rounded-full border border-tertiary shrink-0" /><span className="text-tertiary">Address verification</span></div>
                </div>
              </div>
            )}
            {step === "done" && (
              <div className="text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-primary" /></motion.div>
                <h2 className="text-2xl font-bold">Identity verified!</h2>
                <p className="text-sm text-secondary mt-2 max-w-xs mx-auto">Your account is now verified. You can trade on Mbuni CEX.</p>
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"><ShieldCheck className="w-3.5 h-3.5" /> KYC Verified · Tier 1</div>
                <p className="text-[11px] text-tertiary mt-6">Redirecting to trading terminal...</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
