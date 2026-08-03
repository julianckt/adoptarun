# Donation & Fundraising System Blueprint

Status: resolved  
Type: task  

## Question

What is the architectural blueprint for the future peer-to-peer donation and fundraising feature?

## Resolution & Detailed Specs

### 1. Architectural Strategy & Platform Selection
- **Platform Engine**: **Raisely REST API v3** selected for peer-to-peer (P2P) fundraising automation (Flow A).
- **Fee Model**: **0% Platform Fee** (funded via optional donor tipping).
- **Hong Kong Localization**: Native HKD currency processing, direct Stripe account connectivity with local HK Section 88 tax-exempt charities.
- **Custom Branding**: Hosted on Raisely under custom domain `donate.adoptarun.hk/profiles/:adopter_id` (via DNS CNAME mapping to `cname.raisely.com`).
- **Zero Intermediary Touch**: 100% of donor payments flow directly from donor card -> Stripe HK -> Charity Bank Account. Adopt-a-Run holds $0 zero-liability and zero money transmitter licensing obligations.

---

### 2. URL Routing & Entry Points
- **Public Shareable URL**: `adoptarun.hk/donate/:adopter_id` (redirects or embeds the runner's campaign).
- **Deterministic Raisely P2P Profile URL**: `https://donate.adoptarun.hk/profiles/:adopter_id` (requires zero database storage; computed deterministically from `adopter_id`).
- **Embedded Run Log Widget**: Embedded "Back this Run" donor progress card and live donor wall directly inside the `/log/:adopter_id` dashboard.

---

### 3. Decoupled Cloudflare D1 Database Schema
To ensure the core MVP website (signups, catalog, Strava OAuth, GPX parser, digital certificates) can be built and deployed without any dependency on the donation system, the `adoptions` table remains **100% UNTOUCHED** (exact schema from Ticket #08).

All donation tracking lives in a standalone `donations` table created only when donation features are deployed:

```sql
-- Decoupled Standalone Donations Table
CREATE TABLE donations (
  donation_id TEXT PRIMARY KEY,          -- Internal unique key (e.g. don_9x8f2a)
  adopter_id TEXT NOT NULL,             -- Foreign Key referencing adoptions.adopter_id
  raisely_donation_id TEXT UNIQUE,      -- Webhook idempotency key from Raisely
  donor_name TEXT DEFAULT 'Anonymous',   -- Donor display name on HUD
  amount_cents INTEGER NOT NULL,        -- Amount in HKD cents (e.g. 10000 = HK$100.00)
  currency TEXT DEFAULT 'HKD',
  message TEXT,                          -- Cheer/encouragement note for runner
  payment_method TEXT,                  -- Payment rail used ('card', 'apple_pay', etc.)
  status TEXT DEFAULT 'succeeded',       -- Transaction status ('succeeded', 'refunded')
  created_at TEXT NOT NULL,             -- ISO 8601 timestamp
  FOREIGN KEY (adopter_id) REFERENCES adoptions(adopter_id) ON DELETE CASCADE
);

-- Performance Index for HUD Donor Wall Queries
CREATE INDEX idx_donations_adopter_created ON donations(adopter_id, created_at DESC);
```

---

### 4. Legal & Tax Compliance (Section 88 IRD)
- **Tax Deductibility**: Tax receipts for donations of HK$100+ are issued directly under the Section 88 charity's legal name and IRD registration number via Stripe Connect.
- **Platform Role**: Adopt-a-Run operates strictly as a technology referrer / directory, avoiding money holding and tax receipting liabilities.
- **Research Reference**: Full platform comparison, payment rail analysis, and legal evaluation documented in `docs/research/charity-donation-platforms-hk-evaluation.md`.
