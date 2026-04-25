# 💰 FinanceOS — Personal Finance Management App

> A full-stack DevOps mini-project: Next.js 14 + NestJS + PostgreSQL (Neon), containerised with Docker, deployed via Kubernetes + ArgoCD, monitored with Prometheus & Grafana.

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────┐
│                   MONOREPO                       │
│  back-front-financial-app/                       │
│  ├── frontend/          (Next.js 14, TypeScript) │
│  ├── backend/           (NestJS 10, TypeScript)  │
│  ├── k8s/               (Kubernetes manifests)   │
│  ├── argocd/            (GitOps config)          │
│  └── .github/workflows/ (CI/CD pipelines)        │
└─────────────────────────────────────────────────┘
         │                        │
   [Port 3000]              [Port 3001]
   Next.js UI           NestJS REST API
         │                        │
         └──────── Neon PostgreSQL (cloud) ─────────
```

### DevOps Chain

```
Plan (GitHub Projects)
  → Code (Git branches: feat/ bugfix/ hotfix/)
  → Build (npm run build + Docker)
  → Test (Jest unit tests + ESLint)
  → Release (GitHub Actions CI)
  → Deploy (ArgoCD GitOps → Minikube/K8s)
  → Operate (Kubernetes pods)
  → Monitor (Prometheus + Grafana)
  → Improve (alerts + backlog)
```

---

## 🚀 Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Clone & install
```bash
git clone https://github.com/YOUR_USERNAME/back-front-financial-app.git
cd back-front-financial-app
npm install   # installs all workspaces
```

### 2. Configure environment
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env — set DATABASE_URL and JWT_SECRET
```

### 3. Setup database
```bash
cd backend
npx prisma migrate deploy
npm run prisma:seed   # loads demo data
```

### 4. Run with Docker Compose
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- Swagger docs: http://localhost:3001/api/docs

### 5. Demo credentials (after seed)
```
Email:    demo@financeos.tn
Password: Demo1234!
```

---

## 🧪 Tests & Lint

```bash
# All
npm run test
npm run lint

# Backend only
npm run test:backend     # Jest unit tests
npm run lint:backend     # ESLint

# Frontend only
npm run test:frontend
npm run lint:frontend
```

---

## 🐳 Docker

```bash
# Build individual images
docker build -t financial-backend ./backend
docker build -t financial-frontend ./frontend

# Run full stack
docker-compose up -d
```

---

## ☸️ Kubernetes Deployment (Minikube)

```bash
# Start cluster
minikube start --cpus=2 --memory=4096

# Apply manifests
kubectl apply -f k8s/namespace.yaml

# Create secrets (never commit real values!)
kubectl create secret generic financial-secrets \
  --namespace=financial-app \
  --from-literal=database-url="YOUR_NEON_URL" \
  --from-literal=jwt-secret="your-strong-secret"

kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/monitoring.yaml

# Check status
kubectl get pods -n financial-app
```

---

## 🔄 ArgoCD (GitOps)

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Apply the app
kubectl apply -f argocd/application.yaml

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port-forward UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
ArgoCD UI: https://localhost:8080 (admin / password above)

---

## 📊 Monitoring

```bash
# Port-forward Prometheus
kubectl port-forward svc/prometheus-service -n financial-app 9090:9090

# Port-forward Grafana
kubectl port-forward svc/grafana-service -n financial-app 3003:3003
```
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3003 (admin / admin123)

**Metrics exposed** at `GET /api/metrics`:
- `http_requests_total` — request count by method/path/status
- `http_request_duration_seconds` — latency histogram
- Default Node.js process metrics (CPU, memory, event loop)

---

## 🔒 DevSecOps

| Check | Tool | When |
|---|---|---|
| Code lint | ESLint | Every push |
| Dependency audit | npm audit | CI pipeline |
| Secret scanning | Gitleaks | CI pipeline |
| Container scan | Trivy | On Docker push |
| Code quality | SonarQube | Every push |
| Secrets management | GitHub Secrets | CI/CD only |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # JWT auth (register, login, /me)
│   │   ├── transactions/   # CRUD + stats + trend
│   │   ├── budgets/        # Budget tracking with progress
│   │   ├── goals/          # Savings goals + contributions
│   │   ├── dashboard/      # Aggregated summary
│   │   └── metrics/        # Prometheus endpoint
│   └── config/
│       └── prisma.service  # DB client
├── prisma/
│   ├── schema.prisma       # DB schema
│   └── seed.ts             # Demo data
└── Dockerfile

frontend/
├── src/
│   ├── app/
│   │   ├── login/          # Login page
│   │   ├── register/       # Register page
│   │   └── dashboard/      # Protected routes
│   │       ├── page.tsx        # Overview + charts
│   │       ├── transactions/   # Full CRUD table
│   │       ├── budgets/        # Budget progress
│   │       └── goals/          # Savings goals
│   ├── components/
│   │   ├── layout/Sidebar.tsx
│   │   └── ui/StatCard.tsx
│   ├── hooks/useAuth.tsx    # Auth context
│   └── lib/api.ts           # Axios client
└── Dockerfile

k8s/
├── namespace.yaml          # Namespace + secrets template
├── backend-deployment.yaml
├── frontend-deployment.yaml
├── ingress.yaml
├── monitoring.yaml         # Prometheus + Grafana
├── prometheus.yml
└── alert_rules.yml

.github/workflows/
└── ci.yml                  # Full CI/CD pipeline

argocd/
└── application.yaml        # GitOps sync config
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts |
| Backend | NestJS 10, TypeScript, Passport JWT |
| Database | PostgreSQL (Neon cloud), Prisma ORM |
| Containerisation | Docker, Docker Compose |
| Orchestration | Kubernetes (Minikube) |
| GitOps/CD | ArgoCD |
| CI | GitHub Actions |
| Security | Trivy, Gitleaks, npm audit, SonarQube |
| Monitoring | Prometheus, Grafana, prom-client |

---

## 📬 API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET/POST | /api/transactions | List / Create |
| GET | /api/transactions/stats/trend | 6-month trend |
| GET | /api/transactions/stats/categories | Category breakdown |
| GET/POST | /api/budgets | List / Create budgets |
| GET/POST | /api/goals | List / Create goals |
| POST | /api/goals/:id/contribute | Add to goal |
| GET | /api/dashboard/summary | Full dashboard data |
| GET | /api/metrics | Prometheus metrics |
| GET | /api/docs | Swagger UI |
