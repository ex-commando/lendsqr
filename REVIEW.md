# Review Document - Demo Credit MVP

## Architecture & Decisions

### 1. Technology Stack
- **NodeJS/TypeScript**: Type safety and modern async/await patterns.
- **Express**: Lightweight and flexible web framework.
- **KnexJS**: Query builder allowing raw SQL power with migration support. Chosen over full ORMs (TypeORM/Prisma) for explicit control over transactions and performance in a financial context.

### 2. Design Patterns
- **Service Layer Pattern**: Business logic (e.g., `fundWallet`, `transferFunds`) is isolated in `services/`, keeping Controllers thin and focused on HTTP concerns.
- **Transaction Management**: All financial operations use `db.transaction`. We explicitly pass the `trx` object to ensure atomicity. If any step fails, the entire operation rolls back.

### 3. Adjutor (Lendsqr) Integration
- We check the blacklist *before* creating a user in the DB.
- **Blacklist Logic**: The real Adjutor API returns a 200 OK with "Successful" even for clean users. We refined the logic to explicitly block only when the message says "Karma found", preventing false positives during onboarding.

## Challenges & Fixes (Development Log)

During the development of this MVP, several configuration challenges were encountered effectively solved to ensure a stable environment:

### 1. Database Migrations with TypeScript
**Challenge**: `knex migrate` commands failed with syntax errors because the Knex CLI (running in standard Node.js) could not parse the `knexfile.ts` (TypeScript) configuration directly.
**Fix**: 
- Converted `knexfile.ts` to `knexfile.js`. This allows the CLI to load the configuration natively without complex runtime transpilation flags.
- Updated `package.json` scripts to use `node -r ts-node/register ...` explicitly for loading the migrations themselves.

### 2. Test Suite Compatibility (Jest vs. TypeScript)
**Challenge**: Initial attempts to run `npm test` failed with "Unexpected token" errors. This was caused by:
- A version mismatch between `jest` and `ts-jest`
- `uuid` library version 11+ defaulting to ESM (ECMAScript Modules) which conflicted with our CommonJS compilation target for tests.
**Fix**:
- Downgraded `uuid` to version `9.x` to ensure full CommonJS compatibility.
- Aligned `jest` and `ts-jest` versions.
- Explicitly configured `jest.config.js` to transform `.ts` files using `ts-jest`.

### 3. Adjutor API Response Handling
**Challenge**: Integration tests initially failed with "User Blacklisted" for all new registrations. Debugging revealed that the Adjutor API returns `200 OK` with `status: success` even for clean users (likely indicating a successful *lookup*), which the initial logic interpreted as a positive blacklist hit.
**Fix**: Updated `adjutorService.ts` to inspect the response `message`. Only a message of "Karma found" triggers a blockage; "Successful" is treated as clean.

### 4. Test Coverage Collection
**Challenge**: Ensuring coverage reports accurately reflect the TypeScript source files rather than compiled outputs or failing to collect at all.
**Fix**: configured `collectCoverageFrom` in `jest.config.js` to target `src/**/*.ts`.

## API Documentation

### Auth
- `POST /api/v1/auth/register`
  - Body: `{ "name": "John", "email": "john@ex.com", "password": "pass" }`
- `POST /api/v1/auth/login`
  - Body: `{ "email": "john@ex.com", "password": "pass" }`
  - Returns: `{ "token": "..." }`

### Wallets (Requires Bearer Token)
- `GET /api/v1/wallets` - Get balance.
- `POST /api/v1/wallets/fund`
  - Body: `{ "amount": 1000 }`
- `POST /api/v1/wallets/withdraw`
  - Body: `{ "amount": 200 }`
- `POST /api/v1/wallets/transfer`
  - Body: `{ "email": "jane@ex.com", "amount": 500 }`

## Engineering Rigor
- **Dryness**: Shared response utilities and centralized config.
- **Security**: Helmet, standardized error handling, and parameterized queries via Knex.
