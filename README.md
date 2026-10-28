# Aakalan — AICTE Approval & Compliance Intelligence Platform
### Smart India Hackathon (SIH) Prototype

Aakalan is a modern, enterprise-grade regulatory workflow and compliance intelligence platform designed to digitise and centrally monitor All India Council for Technical Education (AICTE) approval cycles, technical scrutiny, EVC committee scheduling, and institutional compliance monitoring.

---

## 🏛️ Core Role-Specific Portals

Aakalan implements **four genuinely different, role-isolated portals** backed by server-side Role-Based Access Control (RBAC):

1. **Administration Portal (`/admin/dashboard`)**
   - High-level national KPI metrics across all 6 AICTE regional bureaus.
   - Live Application Pipeline by stage, region-wise pendency, and ageing distribution.
   - **Workflow Configuration Engine**: Customise route templates (`Scrutiny + EVC`, `Only Scrutiny`, `EVC + SAC/SHC`, `Only EVC`, and `Custom Route`), sequence orders, SLA days, and mandatory flags.
   - Officer & Workload Management, EVC Oversight with conflict detection, and Immutable Audit Logs.
   - *Security Guard: Self-service "New Application" or "Submit Application" actions are strictly stripped from the Admin Portal.*

2. **Technical Scrutiny Officer Desk (`/scrutiny/dashboard`)**
   - Restricted to cases assigned to the authenticated scrutiny officer.
   - Document inspection workspace with verification stamps.
   - Record formal observations, mark deficiencies, and return applications with mandatory reasons.
   - Complete scrutiny and advance applications to the next configured workflow stage.

3. **Regional Officer Directorate (`/regional/dashboard`)**
   - Scoped strictly to the officer's jurisdiction (e.g. Western Region).
   - Regional application register, EVC inspection panel constitution, conflict checks, and regional pendency monitoring.

4. **Institutional Portal (`/institution/dashboard`)**
   - Dedicated workspace for colleges/polytechnics (e.g. Bharati Vidyapeeth Institute of Technology).
   - **New Application Wizard**: Multi-step application creation and draft saving.
   - Deficiencies & Clarification response portal.
   - Institutional Document Repository & 30-year lease renewal tracking.

---

## 🔐 Persona Login & Demo Credentials

The application features a dedicated Persona Login interface (`/login`) with 1-click evaluation access for each role:

| Persona Role | Demo Official | Email Identifier | Default Landing Page | Key Role Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Central Administration** | Dr. Arvind K. Sharma | `admin@aicte.gov.in` | `/admin/dashboard` | National KPIs, Workflow Route SLA Config, Audit Logs |
| **Scrutiny Officer** | Dr. Ramesh Iyer | `ramesh.iyer@aicte.gov.in` | `/scrutiny/dashboard` | Desk Verification, Deficiency Objections, Scrutiny Clearance |
| **Regional Officer** | Smt. Meenakshi Sundaram | `regional.wr@aicte.gov.in` | `/regional/dashboard` | Western Region Bureau, EVC Committee Scheduling, Conflict Checks |
| **Technical Institution** | Prof. Ananya Sen | `registrar@bvit.ac.in` | `/institution/dashboard` | New EoA Application Wizard, Clarifications, Lease Validity |

---

## 🎨 Design System

- **Deep Aubergine**: `#321B35` (Navigation sidebar & brand mark)
- **Ice Silver**: `#E9EAEE` (Workspace canvas & background)
- **Marigold**: `#F2B544` (Accent highlights & priority badges)
- **Porcelain White**: `#FFFFFF` (Data cards & modal dialogs)
- **Primary Text**: `#27232C`
- **Muted Text**: `#77727E`
- **Border**: `#D9D8DE`
- **Status Green**: `#27845A` | **Warning**: `#C58A16` | **Overdue/Error**: `#C44949`

---

## ⚙️ Quick Local Setup & Running

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Full-Stack Server
```bash
npm run dev
```
The Express full-stack server with Vite middleware will start on:
```
http://localhost:3000
```

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🧪 Automated Testing & Diagnostics

Aakalan includes an automated workflow state transition test runner verifying:
- Authorized stage progression forward (e.g. Scrutiny to EVC)
- Unauthorized role access blocking
- Enforcement of mandatory detailed remarks on deficiency returns
- Blocking of scrutiny completion when unresolved deficiencies exist

Run the tests inside the UI under **Engine Tests & API (`/admin/system`)** or query:
```bash
curl http://localhost:3000/api/tests/workflow
```

---

## 📑 OpenAPI Documentation
Access the OpenAPI 3.0 specification at:
```
GET /api/openapi.json
```

---

## 🎙️ Aakalan Vaak — Voice Intelligence Assistant

Aakalan includes an integrated voice assistant accessible via the floating microphone button at the bottom-right corner:
- **Audio & Speech Engine**: Native Web Speech recognition (`en-IN`, `hi-IN`, Hinglish) and SpeechSynthesis with real-time waveform indicators.
- **Microphone Consent & Safety**: Explicitly requests permission before audio capture and stops all tracks upon session close or logout.
- **States**: `Idle`, `Connecting`, `Listening`, `Processing`, `Speaking`, `Error`, and `Unsupported Browser`.
- **Text Chat Fallback**: Fully functional keyboard input fallback for environments without microphone support.
- **Intelligence Capabilities**:
  - Answers real-time pendency questions.
  - Summarizes regional workload and scrutiny bottlenecks.
  - Identifies overdue cases and upcoming SLA deadlines.
  - Explains approval routes and skip rules.
  - Directly triggers navigation to authorized portal views.
