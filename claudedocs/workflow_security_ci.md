# Workflow: Security Hardening & GitHub Actions CI

## Overview
Add production-grade security middleware to the Express server, security headers to the Next.js client, and a GitHub Actions CI pipeline for automated checks.

---

## Phase 1: Server Security Middleware

### 1.1 Install security dependencies
```bash
cd server && npm install helmet express-rate-limit express-mongo-sanitize hpp
```

### 1.2 Add Helmet (HTTP security headers)
**File:** `server/index.js`
- Add `helmet()` middleware before routes
- Configures: CSP, X-Frame-Options, X-Content-Type-Options, HSTS, etc.

### 1.3 Add rate limiting
**File:** `server/index.js`
- Global rate limit: 100 requests per 15 minutes per IP
- Auth-specific rate limit: 10 requests per 15 minutes on `/api/auth/*`

### 1.4 Add NoSQL injection prevention
**File:** `server/index.js`
- Custom sanitizer for `req.body` (strips keys starting with `$` or containing `.`)
- Note: `express-mongo-sanitize` and `hpp` are incompatible with Express 5 (`req.query` is read-only)

### 1.6 Add request size limit
**File:** `server/index.js`
- `express.json({ limit: '10kb' })` — prevent large payload attacks

### 1.7 Sanitize error responses in production
**File:** `server/index.js`
- Add global error handler that hides stack traces when `NODE_ENV === 'production'`

---

## Phase 2: Next.js Security Headers

### 2.1 Add security headers to next.config.mjs
**File:** `client/next.config.mjs`
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: camera=(), microphone=(), geolocation=()
- X-DNS-Prefetch-Control: on

---

## Phase 3: GitHub Actions CI Pipeline

### 3.1 Create workflow file
**File:** `.github/workflows/ci.yml`

**Triggers:** push to `main`, pull requests to `main`

**Jobs:**

#### Job 1: `server-checks`
- Checkout code
- Setup Node.js 20
- `cd server && npm ci`
- `cd server && npx jest --ci --coverage`
- `cd server && npm audit --audit-level=high`

#### Job 2: `client-checks`
- Checkout code
- Setup Node.js 20
- `cd client && npm ci`
- `cd client && npx jest --ci --coverage`
- `cd client && npm run build` (type/lint check)
- `cd client && npm audit --audit-level=high`

#### Job 3: `security-scan`
- Checkout code
- Run `npm audit` on both packages
- Optional: OWASP dependency check

---

## Phase 4: Update .env.example

### 4.1 Add NODE_ENV documentation
**File:** `.env.example`
- Add `NODE_ENV=development` with comment

---

## Execution Order
```
Phase 1 (1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7)
Phase 2 (independent, can parallel with Phase 1)
Phase 3 (after Phases 1 & 2, so CI runs against secured code)
Phase 4 (anytime)
```

## Validation Checkpoints
- [ ] After Phase 1: `cd server && npx jest` — all 83 tests pass
- [ ] After Phase 2: `cd client && npm run build` — builds successfully
- [ ] After Phase 3: Push branch, verify Actions run green
- [ ] After Phase 4: Review .env.example completeness

## Next Step
Run `/sc:implement` to execute this plan step by step.
