# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (add -- -p 3001 for a different port)
npm run build        # Production build
npm run lint         # ESLint (flat config, eslint.config.js)
npm run test         # Vitest in watch mode
npm run test:run     # Vitest single run (CI)
npm run db:push      # Push Drizzle schema to Vercel Postgres
npm run db:studio    # Open Drizzle Studio
npm run db:seed      # Seed database with sample data
```

To run a single test file:
```bash
npx vitest run src/__tests__/classFilter.test.ts
```

Hardhat (smart contracts):
```bash
npx hardhat compile  # Compile Solidity contracts
npx hardhat test     # Run contract tests
```

## Architecture

### Routing & Pages
- **App Router only** — all pages live in `src/app/`
- `src/views/` holds page-level React components (not used for routing — `pages/` is reserved by Next.js)
- `(protected)/` route group: `src/app/(protected)/layout.tsx` does server-side auth check, redirects to `/login` if unauthenticated
- Route constants are in `src/lib/routes.ts`

### Auth
- NextAuth v4 with Credentials provider (email + bcrypt against `profiles` table)
- Optional wallet-based auth via SIWE (Sign-In with Ethereum)
- `auth()` in `src/lib/auth.ts` = `getServerSession(authOptions)` — use this in server components/API routes
- Session type is augmented in `src/types/next-auth.d.ts` to include `user.id`
- Route handler at `src/app/api/auth/[...nextauth]/route.ts`
- Nonce endpoint for SIWE at `src/app/api/auth/nonce/route.ts`

### Database
- Drizzle ORM + `@vercel/postgres` — client in `src/db/index.ts`, schema in `src/db/schema.ts`
- 7 tables: `profiles`, `organizations`, `organization_instructors`, `classes`, `bookings`, `packages`, `user_packages`
- `packages` and `user_packages` use `organization_uid` (not `company_id`)
- Next.js 15: dynamic route params are `Promise<{ id: string }>` — always `await params`

### State / Data Fetching
- Three client-side context providers in `src/providers/`: `AuthProvider`, `ClassesProvider`, `OrganizationProvider`
- All providers fetch from `/api/*` routes
- Provider tree is assembled in `src/app/providers.tsx`: `SessionProvider → QueryClientProvider → WagmiProvider → RainbowKitProvider → AuthProvider → ClassesProvider → OrganizationProvider`

### Web3 / Smart Contracts
- **Wagmi + RainbowKit** for wallet connection (`src/lib/wagmi.ts`)
- **SIWE** (Sign-In with Ethereum) for wallet-based authentication
- Two Solidity contracts in `contracts/`:
  - `PulseBooking.sol` — on-chain class registration and booking
  - `PulsePackages.sol` — on-chain package purchases with USDC
- Contract ABIs and addresses in `src/lib/contracts.ts`
- Hardhat config in `hardhat.config.cjs`, tests in `test/`
- Booking and class creation optionally record on-chain if `NEXT_PUBLIC_BOOKING_CONTRACT_ADDRESS` is set

### UI
- shadcn/ui components live in `src/components/ui/` and `src/components/ui/legacy/`
- Custom `Input` component at `src/components/ui/Input.tsx` (accepts optional `className`)
- Tailwind CSS; `cn()` helper in `src/lib/utils.ts`
- Toast: Sonner (`src/components/ui/use-toast.ts`)

### Tests
- Vitest + jsdom + React Testing Library, configured in `vite.config.ts`
- Test files in `src/__tests__/`
- Setup file: `src/test/setup.ts` (imports `@testing-library/jest-dom`)
- Hardhat contract tests in `test/`

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `POSTGRES_URL` — Vercel Postgres connection string
- `NEXTAUTH_SECRET` — random 32-char string
- `NEXTAUTH_URL` — deployment URL (`http://localhost:3000` for dev)

Optional:
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe keys for package payments
- `NEXT_PUBLIC_BOOKING_CONTRACT_ADDRESS` — deployed PulseBooking contract address
- `NEXT_PUBLIC_PACKAGES_CONTRACT_ADDRESS` — deployed PulsePackages contract address

## Notes
- `supabase/` and `src/integrations/supabase/` are legacy — excluded from TypeScript compilation, do not use
- All interactive components and providers require `"use client"` directive
- ESLint uses flat config (`eslint.config.js`), not `.eslintrc`
- TypeScript is intentionally lenient (`strict: false`, `noImplicitAny: false`)
