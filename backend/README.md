Here's the **full, updated README** that includes all the new password authentication endpoints, the health check, and the existing features. You can copy and paste this into your `README.md` file.

```markdown
# Brick API – Frontend Integration Guide

## Base URL

- **Development:** `http://localhost:3000`
- **Production:** `https://brick-roommate-finder.onrender.com`

---

## Unified Response Format

Every successful response follows:

```json
{
  "status": "success",
  "message": "Request successful",
  "data": { ... }
}
```

The `data` field contains the actual payload (user object, array, or null).

Errors (4xx/5xx) use NestJS’s default error format:

```json
{
  "statusCode": 400,
  "message": ["validation error or description"],
  "error": "Bad Request"
}
```

---

## Authentication & Session Management

Brick uses **HttpOnly, Secure, SameSite=Lax** (SameSite=None in production) cookies to store a **JWT session token** named `brick.session_token`.

- You **never** need to read or store the token manually.
- The browser automatically sends the cookie on every request if you use `credentials: 'include'` (fetch) or `withCredentials: true` (axios).
- The session lasts **30 days** with sliding expiration (active users stay logged in).
- **Instant logout** is possible because the database is the source of truth for session validity.

---

## Authentication Endpoints

### OTP Flow (Existing)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/auth/otp/request` | Send a 6‑digit OTP to the user’s inbox | No |
| POST | `/auth/otp/verify` | Verify OTP → creates/updates user + creates session, sets cookie | No |

**Request OTP**
```json
POST /auth/otp/request
{ "email": "user@example.com" }
```
Response (always 200):
```json
{
  "status": "success",
  "message": "Resource created successfully",
  "data": { "message": "If an account exists, a verification code has been sent." }
}
```

**Verify OTP (Login / Register)**
```json
POST /auth/otp/verify
{ "email": "user@example.com", "code": "123456" }
```
Success (200): returns `data.user` object and sets cookie.  
If the code is wrong/expired → `400 Bad Request`.

There is **no separate register endpoint** – a new user is automatically created if the email doesn’t exist.

---

### Password Flow (New)

These endpoints allow users to sign up / log in with a traditional email + password combination.

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/auth/password/signup` | Create account with email & password, sets cookie | No |
| POST | `/auth/password/login` | Sign in with email & password, sets cookie | No |
| PUT | `/auth/password/set` | Add a password to an existing OTP account | Yes |
| PUT | `/auth/password/update` | Change existing password (requires current password) | Yes |

**Password requirements:** min 8 characters, at least one uppercase letter, one lowercase letter, and one number or special character.

**Examples:**

**Sign Up**
```json
POST /auth/password/signup
{ "email": "new@example.com", "password": "StrongPass1!" }
```
Response (201): `data.user` and sets cookie.

**Login**
```json
POST /auth/password/login
{ "email": "user@example.com", "password": "StrongPass1!" }
```
Response (200): `data.user` and sets cookie.

**Set Password (for existing OTP user)**
```json
PUT /auth/password/set
{ "password": "StrongPass1!" }
```
Response (200): `{ success: true }`

Users can use both OTP and password interchangeably. If a user has a password set, they can log in with either method.

---

### Session & User Management

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/auth/session` | Current user or `null` | Optional |
| GET | `/auth/me` | Current user (must be logged in) | Required |
| POST | `/auth/logout` | Logout current device, clear cookie | Required |
| POST | `/auth/logout-all` | Logout all devices, clear cookie | Required |
| PATCH | `/auth/onboarding` | Set `userType` (`"seeker"` / `"landlord"`) after first login | Required |

### Health Check

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/health` | Lightweight ping for uptime monitors (returns 200) | No |

---

## Seeker Profile

After onboarding as a `"seeker"`, you can manage the seeker profile.

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/profile/seeker` | Get own seeker profile | Required |
| PUT | `/profile/seeker` | Create/update profile (partial or full) | Required |

**Allowed fields** (all optional, but `university` is required for matching):

| Field | Type | Notes |
|-------|------|-------|
| `university` | string | Must match a university from the universities list |
| `hasApartment` | boolean | `true` if you already have a place |
| `location` | string | Neighbourhood / area |
| `budgetMin` | number | Minimum monthly budget |
| `budgetMax` | number | Maximum monthly budget |
| `moveInDate` | ISO date string | Optional, used for compatibility scoring |
| `duration` | `"short"` / `"long"` / `"flexible"` | Optional |
| `genderPreference` | `"male"` / `"female"` | Required for matching |
| `occupation` | string | |
| `bio` | string | Free text |
| `lifestyleTags` | string[] | e.g. `["non-smoker", "tidy", "early-bird"]` |

**Important:** `genderPreference` only accepts `"male"` or `"female"`. Any other value will be rejected with a `400` error.

---

## Universities

Universities are managed centrally so seekers can pick from a pre-seeded list.

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/universities` | List all universities (alphabetically) | No |
| POST | `/universities` | Add a new university (admin) | No |
| PATCH | `/universities/:id` | Rename a university | No |
| DELETE | `/universities/:id` | Delete a university | No |

The initial seed contains: `EKSU`, `UNILAG`, `OAU`, `UI`, `FUTA`, `FUNAAB`.

---

## Finding a Roommate (Matching)

### Get Compatible Matches

Returns a **paginated** list of other seekers from the **same university**, sorted by compatibility score (highest first). Only matches with a score **≥ 40%** are shown.

```
GET /matches?page=1&limit=20
```

Response:
```json
{
  "status": "success",
  "message": "Request successful",
  "data": {
    "data": [
      {
        "user": {
          "id": "cl...",
          "name": "Alice",
          "image": null,
          "university": "University of Lagos",
          "hasApartment": false,
          "budgetMin": 150000,
          "budgetMax": 250000,
          "moveInDate": "2026-09-01T00:00:00.000Z",
          "lifestyleTags": ["non-smoker", "tidy"],
          "genderPreference": "female",
          "bio": "..."
        },
        "compatibilityScore": 67
      },
      ...
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 42
    }
  }
}
```

The frontend should display each match as a card with the `compatibilityScore` as a percentage badge. The list is already sorted descending.

---

## Connections (Send / Accept / Reject Roommate Requests)

All connection endpoints require the user to have `userType = "seeker"`.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/connections` | Send a roommate request `{ "receiverId": "target-user-id" }` |
| GET | `/connections/incoming` | Received requests |
| GET | `/connections/outgoing` | Sent requests |
| PUT | `/connections/:id/accept` | Accept an incoming request |
| PUT | `/connections/:id/reject` | Reject an incoming request |
| PUT | `/connections/:id/withdraw` | Withdraw your own request |

---

## How to Make Authenticated Requests

Use `credentials: 'include'` with `fetch`, or `withCredentials: true` with axios.

```js
// Fetch example
const res = await fetch('https://brick-roommate-finder.onrender.com/auth/me', {
  credentials: 'include',
});
const json = await res.json();
console.log(json.data); // the user object
```

```js
// Axios example
axios.get('https://brick-roommate-finder.onrender.com/auth/me', { withCredentials: true });
// or globally: axios.defaults.withCredentials = true;
```

---

## Complete Example Flow

1. **Login** (OTP or Password)
   - OTP: `POST /auth/otp/request` → `POST /auth/otp/verify`
   - Password: `POST /auth/password/login`
2. **Onboarding** (if first time)  
   `PATCH /auth/onboarding { "userType": "seeker" }`
3. **Fill Profile**  
   `PUT /profile/seeker` with university, budget, tags, etc.
4. **Browse Matches**  
   `GET /matches`
5. **Send Request**  
   `POST /connections { "receiverId": "..." }`
6. **Manage Connections**  
   Check `GET /connections/incoming` and `GET /connections/outgoing`. Accept/reject as appropriate.

---

## Important Notes

- The cookie is **HttpOnly** – JavaScript cannot read it (protection against XSS).
- The session token is a **JWT** stored in the cookie; the database is the ultimate authority (instant logout possible).
- Rate limiting is active on OTP endpoints: max 3 requests per minute per IP for OTP request, max 5 for verify. Do not hammer them.
- All successful responses have `"status": "success"`. Check for this field (or the HTTP status code) to determine success.
- Gender preference is **mandatory** for matching and only accepts `"male"` or `"female"`. Sending `"any"` or any other value will result in a `400` error.
- Matching only works between seekers of the **same university** and with a compatibility score ≥ 40%. The score is calculated from budget overlap, lifestyle tags, apartment status, move‑in date, and gender preference.
- Existing OTP users can set a password via `PUT /auth/password/set` to gain the ability to log in with email + password.

---

If anything is unclear or you need additional endpoints, please ask.
```