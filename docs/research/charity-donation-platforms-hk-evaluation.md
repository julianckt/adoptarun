# Third-Party Charity Donation Platforms Evaluation for Hong Kong & Peer-to-Peer Integration

**Date:** August 2026  
**Context:** Adopt-a-Run Platform Technical Spec & Architectural Blueprint (Ticket #10)  
**Target Region:** Hong Kong (HKD, IRD Section 88 Tax Exemption, Local Payment Rails)

---

## Executive Summary

To select the optimal donation and peer-to-peer (P2P) fundraising platform for Adopt-a-Run, we evaluated 8 major global and Asia-Pacific platforms against key criteria:
1. **Hong Kong Localization**: HKD processing, IRD Section 88 tax deductibility, local payment rails (**FPS**, **PayMe by HSBC**, **Octopus**, **AlipayHK/WeChat Pay HK**).
2. **Platform & Processing Fees**: Transparent platform fee cuts, tipping models, and payment gateway costs.
3. **API & Workflow Capabilities**:
   - **Flow A (Automated P2P Creation)**: Programmatic creation of custom user fundraising pages via API passing route and charity metadata, user-editable, with REST/GraphQL API for live progress queries.
   - **Flow B (Route-Level Event Aggregation)**: Existing route event pages where users are directed to donate, with donor notes/comments containing `adopter_id` queried via API to calculate per-runner progress.
4. **Legal & Compliance Obligations**: Platform licensing, Section 88 receipting, and public fundraising regulations in Hong Kong.

---

## 1. Platform Evaluation Matrix

| Platform | HK Entity & HKD Support | HK Local Payment Rails (FPS / PayMe) | Platform & Gateway Fees | Flow A (P2P API Creation) | Flow B (Route Aggregation & Donor Notes API) | Status / Feasibility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Raisely** | **Yes** (Full HKD & local charity support) | Indirect (Stripe HK card/Apple Pay; custom manual FPS/PayMe notes) | **0% Platform Fee** (Free + donor tips) or 4% flat fee + Stripe (1.5%-2.9%) | **Supported** (`POST /v3/profiles` API creates individual/team P2P pages) | **Supported** (`GET /v3/donations` with webhook payload filtering) | **TOP CANDIDATE** |
| **JustGiving** | Partial (Supports HKD payouts for verified international charities) | No (Cards, PayPal, Apple Pay only) | 0% Platform fee for verified charities + ~1.9%-2.9% card fee | **Supported** (`RegisterFundraisingPage` API) | **Supported** (`GET /v1/fundraising/pages/{slug}/donations`) | Good, but complex user auth & zero FPS/PayMe |
| **Donorbox** | **Yes** (Multi-currency HKD via Stripe/PayPal) | No native FPS/PayMe (Stripe/PayPal rails only) | 2.95% Platform fee + Stripe/PayPal gateway fee (~2.9% + HK$2.35) | **Limited** (P2P available via UI, limited headless page creation) | **Supported** (Zapier / REST API to query donor custom fields) | Moderate fees, lacks local HK wallets |
| **Give.asia** | Partial (Headquartered in SG; SGD processing with HKD conversion) | No (Cards & Apple Pay only; explicitly prohibits FPS/PayMe) | 0% Platform fee + 1.5% Card fee + SGD telegraphic transfer fees | **No Public API** for automated page creation | **Limited** (Manual export / partner inquiry required) | Incompatible (high cross-border payout fees, no FPS) |
| **Givebutter** | **NO** (US Entities & US Bank Accounts Only) | No (USD processing only) | 0% (Donor tips) or 1%-5% + 2.9% + $0.30 | N/A | N/A | **INCOMPATIBLE** (US EIN & US Bank account required) |
| **Open Collective** | **Yes** (Supports HKD via Stripe Fiscal Host) | Depends on Fiscal Host | 0% direct; 4%-15% Fiscal Host fee + Stripe fees | **Supported** (GraphQL API creates Collectives/Projects) | **Supported** (GraphQL API query `donations` and `events`) | Good for un-incorporated groups, higher host fees |
| **SimplyGiving** | N/A | N/A | N/A | N/A | N/A | **CLOSED** (Operation permanently shut down Oct 31, 2025) |
| **Native Stripe Connect + FPS/PayMe (Custom)** | **Yes** (Direct HK native integration) | **FULL** (Native PayMe for Business API / FPS QR + Stripe HK) | **0% Platform Fee** + Stripe HK (1.5% - 2.9% + HK$2.00) | **Native** (D1 database table `adoptions` & `/donate/:adopter_id`) | **Native** (D1 database query aggregated by route `seq_num`) | **BEST NATIVE CONTROL** |

---

## 2. Detailed Platform Analysis

### A. Raisely (Best Third-Party SaaS Choice)
*   **Overview**: Raisely is an Australian-headquartered white-label P2P fundraising platform widely used by non-profits in Hong Kong and Australia.
*   **Fees**:
    *   **Platform Fee**: **0%** on the default "Donor Tips" model (donors are invited to leave an optional tip to support the platform). Alternatively, a flat 4% platform fee can be selected.
    *   **Payment Processing**: Standard Stripe Hong Kong fees apply (~1.5% – 2.9% + HK$2.35 per transaction).
*   **HK Localization & Payment Methods**:
    *   Supports HKD directly connected to the charity's Stripe Hong Kong account.
    *   Supports Credit/Debit cards, Apple Pay, Google Pay natively via Stripe.
    *   *FPS / PayMe*: Can present custom instruction fields and offline bank transfer options during checkout, though dynamic FPS/PayMe QR requires custom webhooks.
*   **API & Workflow Capabilities**:
    *   **Flow A (Automated P2P Page Creation)**: Excellent. Raisely API v3 (`https://api.raisely.com/v3/`) exposes `POST /profiles`. When a runner adopts a route on Adopt-a-Run, our backend can automatically trigger `POST /profiles` with parameters (`userId`, `campaignId`, `goal`, `title`, `publicName`, `routeId`) to instantly generate a custom fundraising profile without requiring manual setup.
    *   **Flow B (Route Aggregation)**: Excellent. We can set up a Raisely "Campaign" per route or a single overarching campaign with profiles grouped by route. `GET /v3/donations` and webhook `donation.created` return real-time donor notes, allowing Adopt-a-Run to track specific `adopter_id` contributions.
*   **Legal & Section 88**: Direct payout to charity's Stripe account allows the charity to issue tax-deductible Section 88 receipts directly to donors.

### B. JustGiving (Established Global Leader)
*   **Overview**: Owned by Blackbaud, JustGiving is a global leader in P2P fundraising.
*   **Fees**: 0% platform fee for registered charities (donor cover/tip model), but non-UK/US charities incur international processing & cross-border FX fees.
*   **API Capabilities**:
    *   **Flow A**: API method `RegisterFundraisingPage` allows external apps to create fundraising pages. However, it requires authenticating the user's personal JustGiving account via OAuth/SSO, breaking Adopt-a-Run's zero-login philosophy.
    *   **Flow B**: Endpoint `GET /v1/fundraising/pages/{slug}/donations` allows fetching donation lists and donor comments.
*   **HK Localization**: Limited local payment options (no FPS or PayMe API integration).

### C. Give.asia (Singapore/Asia Focus)
*   **Overview**: Asia-focused crowdfunding platform.
*   **Fees & Payout Limitations**: 0% platform fee + 1.5% card processing fee. However, all funds are settled into a Singapore bank account in SGD. Payouts to Hong Kong bank accounts incur international telegraphic transfer (TT) fees and FX conversion losses, with minimum payout thresholds (SGD 300).
*   **Payment Methods**: Strictly credit cards and Apple Pay. **Explicitly prohibits FPS, PayMe, PayPal, cash, and bank transfers**.
*   **API**: No public developer API for programmatic campaign or profile creation.

### D. Givebutter & SimplyGiving
*   **Givebutter**: Requires a US EIN (Tax ID) and US Bank Account. All transactions in USD. Unusable for Hong Kong legal entities.
*   **SimplyGiving**: Historically popular in HK, but **permanently ceased operations on October 31, 2025**.

---

## 3. Workflow Implementation Feasibility

### Flow A: Automated P2P Custom Fundraising Page Creation
```
[Runner Adopts Route] 
        │
        ▼
[Adopt-a-Run Backend (Cloudflare Worker)]
        │
        ├── API Request: POST https://api.raisely.com/v3/profiles
        │   Payload: { name, campaignId, goal, meta: { adopter_id, route_id } }
        │
        ▼
[Raisely Returns P2P URL: raisely.com/campaign/adopter-0120-st]
        │
        ▼
[Saved in Cloudflare D1 `adoptions.fundraising_url`]
        │
        ▼
[Donor visits /donate/:adopter_id -> Redirected or Embedded Raisely Form]
```
- **Verdict**: **Feasible via Raisely API v3** or **Native Custom Frontend**.

---

### Flow B: Route-Level Aggregated Fundraising Event
```
[Route #120 Aggregated Event Page on Platform]
        │
        ▼
[Donor Contributes & Inputs Note: "Go Runner 0120-ST!"]
        │
        ▼
[Platform Webhook / API GET /donations]
        │
        ▼
[Adopt-a-Run Webhook Handler parses note for "0120-ST"]
        │
        ▼
[Updates D1 `adoptions` balance & `run_logs` progress HUD]
```
- **Verdict**: **Feasible across Raisely, JustGiving, and Donorbox**.

---

## 4. Hong Kong Legal, Tax & Regulatory Obligations

When integrating charity donations in Hong Kong, the following legal frameworks apply:

### 1. Section 88 Tax Exemption (Inland Revenue Ordinance Cap. 112)
- **Tax Deductibility**: Donors can claim tax deductions for aggregate donations of **HK$100 or more** made to recognized Section 88 charities.
- **Receipting Requirement**: The tax receipt **must be issued directly by the Section 88 charity** (or automatically generated by a platform integrated directly with the charity's merchant account) containing the charity's official registered name, IRD Section 88 reference number, donor's full name, and donation date.
- **Platform Role**: Adopt-a-Run acts strictly as a **technology referrer / directory**. To avoid tax receipting liability, Adopt-a-Run should **not** collect funds into its own corporate bank account.

### 2. Public Subscription Permits (PSP) & Summary Offences Ordinance (Cap. 228)
- **Public Fundraising Rules**: In Hong Kong, conducting public fundraising appeals offline or in public places requires a Public Subscription Permit issued by the Social Welfare Department (SWD).
- **Online Crowdfunding**: Online peer-to-peer personal challenges and online donation referrals for recognized Section 88 charities generally do not require a physical PSP, provided funds flow directly to the charity's approved merchant account.

### 3. Personal Data (Privacy) Ordinance (PDPO Cap. 486)
- Donor contact details and message contents passed between Adopt-a-Run and third-party platforms must comply with PDPO guidelines, requiring clear privacy policy disclosures regarding data processing for donation tracking.

---

## 5. Architectural Recommendation for Ticket #10

Based on primary research, the recommended architectural strategy for Adopt-a-Run is a **Hybrid Primary/Secondary Model**:

1. **Primary Recommendation — Native Custom Front-End with Stripe Connect + Local HK Options**:
   - Keep the frontend on `adoptarun.hk/donate/:adopter_id` to maintain strict brand aesthetics (Tech-Brutalism, GSAP animations, HUD telemetry).
   - Use **Stripe Connect Custom/Express** for credit card/Apple Pay transactions flowing directly to partner charities.
   - Support **Direct HK FPS / PayMe QR receipt upload** for local zero-fee transactions verified by shelter admins.

2. **Secondary Recommendation — Raisely Integration (If Using Third-Party SaaS)**:
   - If an off-the-shelf P2P fundraising platform is preferred to avoid building custom campaign management tools, **Raisely** is the single best third-party platform for Hong Kong.
   - Leverage **Raisely REST API v3** for programmatic profile creation (`Flow A`) and webhook donation syncing (`Flow B`).

---
*Sources & References:*
- [Raisely API v3 Documentation](https://developers.raisely.com/reference)
- [JustGiving Developer Centre](https://developer.justgiving.com/)
- [Inland Revenue Department — Section 88 Tax Exempt Charities](https://www.ird.gov.hk/eng/tax/ach.htm)
- [Social Welfare Department — Public Subscription Permits](https://www.swd.gov.hk/en/index/site_pubsvc/page_faq/sub_publicsubs/)
- [Give.asia Terms & Payout Policies](https://give.asia)
