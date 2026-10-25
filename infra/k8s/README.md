# Mbuni CEX — Helm Chart

Helm chart for deploying Mbuni CEX to Kubernetes.

## Quick start

```bash
helm install mbuni-cex infra/k8s/ \
  --create-namespace \
  --namespace mbuni-cex \
  --set config.NEXTAUTH_URL="https://cex.example.com" \
  --set envSecrets.DATABASE_URL="postgresql://user:pass@host:5432/mbuni_cex?schema=public" \
  --set envSecrets.NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  --set ingress.hosts[0].host="cex.example.com"
```

## Upgrade

```bash
helm upgrade mbuni-cex infra/k8s/ \
  --namespace mbuni-cex \
  -f infra/k8s/values.yaml \
  -f infra/k8s/values-prod.yaml
```

## Uninstall

```bash
helm uninstall mbuni-cex --namespace mbuni-cex
kubectl delete namespace mbuni-cex
```

## Production values

See `values-prod.yaml` for higher replicas, HPA, topology spread, NetworkPolicy, and `prisma migrate deploy`.

## GitOps with ArgoCD

```bash
argocd app create mbuni-cex \
  --repo https://github.com/olekariamunyororo-crypto/Mbuni-CEX \
  --path infra/k8s \
  --dest-namespace mbuni-cex \
  --dest-server https://kubernetes.default.svc \
  --sync-policy auto \
  --auto-prune \
  --self-heal
```
