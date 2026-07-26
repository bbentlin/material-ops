Material Ops

MaterialOps is an inventory and material movement platform built with Next.js, Prisma, PostgreSQL, and TypeScript.

Prerequisites
Node.js 20+
npm
PostgreSQL running locally
Setup
Install dependencies:

npm install

Configure environment files:

Development settings in .env
Test settings in .env.test
Important:
E2E tests must use the test database only, never your real inventory database.

Database
Run migrations and seed development data:
npx prisma migrate dev
npx prisma db seed

Seeded users include:

∙ admin@materialops.com
∙ operator@materialops.com

Run Locally
Start the app:
npm run dev

Open http://localhost:3000

Testing

Unit tests:
npm run test

E2E tests:
npm run test:e2e

Reccommended deterministic E2E run:
npm run test:e2e:clean

The clean flow does this:

1. Reset test database
2. Seed test data
3. Run Playwright E2E tests

Useful Scripts

• dev: run Next.js dev server
• build: create production build
• start: run production build
• lint: run ESLint
• test: run Vitest once
• test:watch: run Vitest in watch mode
• test:e2e: run Playwright tests
• db:test:reset: reset test DB
• db:test:seed: seed test DB
• test:e2e:clean: reset + seed + E2E

Auth and Roles

Role hierarchy:

• VIEWER
• OPERATOR
• ADMIN

Auth and route protection are handled in auth.ts, permissions.ts, and proxy.ts.

Troubleshooting

If E2E affects wrong data:

1. Verify .env.test points to your test database

2. Verify playwright.config.ts loads test env values

3: Run:
  npm run test:e2e:clean

If login fails in tests, reseed test DB:
npm run db:test:seed