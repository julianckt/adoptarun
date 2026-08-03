# Strava API, OAuth 2.0 & Developer Terms Compliance Research

**Date**: August 2026  
**Target Area**: Adopt A Run — Ticket #09 (Strava OAuth & GPX Parser Technical Spec)  
**Primary Sources**:
- [Strava API Developers Documentation & OAuth Guide](https://developers.strava.com/docs/authentication/)
- [Strava API Agreement & Developer Terms (2024/2026 updates)](https://www.strava.com/legal/api)
- [Strava Developer Dashboard Tiers & Rate Limit Guidelines](https://developers.strava.com/docs/rate-limits/)

---

## 1. How Strava OAuth 2.0 & API Work

Strava uses standard **OAuth 2.0 (Authorization Code Flow)** to grant third-party applications limited, token-based access to an athlete's activity data without exposing their login credentials.

```
+------------------+       1. Redirect to Auth URL       +-------------------+
|                  | ----------------------------------> |                   |
|   Adopt A Run    |                                     |    Strava OAuth   |
|   (Client/Edge)  | <---------------------------------- |    (User Consent) |
|                  |       2. Redirect with ?code=...    +-------------------+
+------------------+          &state=0124-JC
        |
        | 3. POST /oauth/token (code + client_secret)
        v
+------------------+       4. Return short-lived token   +-------------------+
|  Cloudflare Edge | ----------------------------------> |  Strava V3 REST   |
|  Function API    | <---------------------------------- |  API Endpoints    |
+------------------+       5. Fetch latest run polyline  +-------------------+
```

### Detailed OAuth Authorization Flow

1. **Authorization Request (Browser Redirect)**:
   The client redirects the user to `https://www.strava.com/oauth/authorize` with query parameters:
   - `client_id`: App's unique Client ID assigned by Strava.
   - `response_type`: Set to `code`.
   - `redirect_uri`: Target callback URL (e.g. `https://adoptarun.org/api/strava/callback`). Must match registered domain.
   - `scope`: Requested permission scopes (e.g., `read,activity:read_all`).
   - `state`: Opaque state string passed through to callback.
   - `approval_prompt`: `auto` (silent if previously authorized) or `force` (re-prompts).

2. **User Consent & Redirect Callback**:
   - User approves access on Strava.
   - Strava redirects the browser to `https://adoptarun.org/api/strava/callback?state=0124-JC&code=a1b2c3...&scope=read,activity:read_all`.

3. **Token Exchange (Server-to-Server / Edge)**:
   - Cloudflare Worker receives authorization `code`.
   - Sends HTTP `POST` request to `https://www.strava.com/api/v3/oauth/token`:
     ```json
     {
       "client_id": "YOUR_CLIENT_ID",
       "client_secret": "YOUR_CLIENT_SECRET",
       "code": "a1b2c3...",
       "grant_type": "authorization_code"
     }
     ```
   - Strava returns:
     - `access_token`: Short-lived bearer token (valid for 6 hours).
     - `refresh_token`: Long-lived token used to refresh expired access tokens.
     - `expires_at`: Unix timestamp of token expiration.
     - `athlete`: Summary JSON object of the authorized athlete.

4. **API Requests & Discard**:
   - Cloudflare Function calls `GET https://www.strava.com/api/v3/athlete/activities?per_page=10` using `Authorization: Bearer {access_token}` header.
   - Matching activity polyline and telemetry are extracted, computed, and saved to D1 `run_logs` & Cloudflare KV cache.
   - The short-lived access token is discarded from memory.

---

## 2. What is the `state` Parameter?

The `state` parameter is an opaque string supplied by the application in the initial authorization request. Strava echoes this exact string back in the query parameters of the callback URL (`redirect_uri`).

### Dual Purpose in Adopt A Run:

1. **CSRF & Security Validation**: Prevents attacker-forged OAuth responses by verifying the state origin.
2. **Zero-Login State Binding**: Because Adopt A Run does not require traditional user login accounts or persistent session cookies, `state` acts as the session bridge carrying adoption context:
   - **For Existing Adopters**: `state=0124-JC` binds the incoming Strava activity directly to `adopter_id: '0124-JC'`.
   - **For Walk-In Runners**: `state=walk_in_wan-chai-dog-run-01` signals to the backend that a new `adoptions` record should be created on the fly before populating `run_logs`.

---

## 3. Strava Permission Choices (Scopes)

Strava defines granular scopes controlling data access:

| Scope | Description | Recommendation for Adopt A Run |
| :--- | :--- | :--- |
| `read` | Read public profile summary data | Default base scope (included) |
| `read_all` | Read private profile data | Not required |
| `profile:read_all` | Read full profile details | Not required |
| `activity:read` | Read public activities | Partial — fails if user's run privacy is set to "Only You" or "Followers" |
| `activity:read_all` | Read public AND private activities | **RECOMMENDED**: Guarantees matching even if runner logs activity as private |
| `activity:write` | Create or edit activities / uploads | Not required (read-only verification) |

**Recommendation**: Request `scope=read,activity:read_all`. This ensures that even if a runner records their run on Strava with privacy settings set to "Followers" or "Only Me", the adoption verification pipeline can still fetch and verify their completed route.

---

## 4. Strava Developer Application & Wait Times

### Standard Tier (Immediate Self-Serve)
- **Wait Time**: **0 minutes** (Instant self-service activation).
- **Process**: Creating an application in Strava Settings (`https://www.strava.com/settings/api`) immediately grants **Standard Tier** credentials.
- **Capacity**: Allows up to **10 connected athletes** out-of-the-box.
- **Rate Limits**: 
  - 200 requests per 15-minute window
  - 2,000 requests per 24-hour day
- **Requirement**: The Strava account creating the developer application must maintain an active Strava subscription.

### Extended Access Tier (Production Scale)
- **Wait Time**: 2 to 4 weeks (subject to manual review by Strava API team).
- **Process**: Required when scaling beyond 10 connected athletes or requesting higher rate limits. Applications are submitted via Strava's developer portal with details on app scope, privacy policy, and logo compliance.

---

## 5. Compliance of Adopt A Run Plans with Strava API Terms

| Term / Rule | Strava Requirement | Adopt A Run Compliance Plan | Status |
| :--- | :--- | :--- | :--- |
| **No AI Model Training** | Strict prohibition on using Strava data to train, fine-tune, or develop AI models. | Adopt A Run uses traditional geometric polyline math & HTML5 Canvas rendering. No AI models consume Strava data. | **COMPLIANT** |
| **Display of User Data** | User activity data must not be displayed publicly in global comparison feeds without consent. | Activity data (polyline, pace, distance) is only rendered on the individual runner's specific adoption log (`/log/:adopter_id`). | **COMPLIANT** |
| **Data Retention & Caching** | API data cached locally must adhere to rate limit guidelines and respect user deletion requests. | Strava polylines and telemetry are cached in Cloudflare KV with a **7-day TTL (`604800`s)** and static derived stats stored in D1 `run_logs`. | **COMPLIANT** |
| **Brand Guidelines & Look/Feel** | Apps must not imitate Strava's proprietary branding, UI, or orange color scheme. | Adopt A Run uses Tech-Brutalism design system with OKLCH Volt `oklch(0.9 0.275 128)` and custom typographic hierarchy (`Scale VF` + `OCR A`). | **COMPLIANT** |
| **Dual Ingestion Safety Net** | Diversified data ingestion pipeline to handle non-Strava users or API edge cases. | Direct browser GPX file upload (`@tmcw/togeojson` + Cloudflare R2) provides a 100% independent fallback. | **COMPLIANT** |

---

## Summary & Action Items for Ticket #09

1. Use **Standard Tier** instant activation during development (supports initial 10 test athletes seamlessly).
2. Request `scope=read,activity:read_all` in authorization URL.
3. Pass `adopter_id` or `walk_in_<route_slug>` via OAuth `state` parameter.
4. Ephemerally exchange token, calculate metrics, store derived telemetry in D1 `run_logs` + 7-day KV cache, and discard access token immediately.
