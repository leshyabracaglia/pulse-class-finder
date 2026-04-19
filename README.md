# Pulse Class Finder

A modern class booking and management platform for fitness studios and wellness organizations. Built with Next.js 15, featuring both traditional and Web3 authentication options.

## Features

- **Class Scheduling** — Browse, filter, and book fitness/wellness classes
- **Organization Management** — Create organizations, manage instructors, and configure settings
- **Booking System** — Real-time capacity tracking with attendance management
- **Package System** — Sell class packages with Stripe integration
- **Web3 Integration** — Optional on-chain booking via smart contracts (RainbowKit + SIWE)
- **User Profiles** — Track booking history and manage account settings

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** Vercel Postgres + Drizzle ORM
- **Auth:** NextAuth v4 (credentials + wallet-based SIWE)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** React Query + React Context
- **Web3:** wagmi, viem, RainbowKit
- **Payments:** Stripe (optional)
- **Testing:** Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- A Vercel Postgres database (or compatible PostgreSQL)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd pulse-class-finder

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
```

### Environment Variables

Edit `.env.local` with your values:

```bash
# Vercel Postgres connection string
POSTGRES_URL=

# NextAuth (generate secret with: openssl rand -base64 32)
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Stripe (optional)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Database Setup

Push the schema to your database:

```bash
npm run db:push
```

Optionally seed with sample data:

```bash
npm run db:seed
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (CI) |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:seed` | Seed database with sample data |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (protected)/        # Auth-required routes
│   │   ├── home/           # Class browser
│   │   ├── profile/        # User profile
│   │   ├── dashboard/      # User dashboard
│   │   ├── organization-*/  # Org management
│   │   └── create-organization/
│   ├── api/                # API routes
│   └── login/              # Public auth page
├── components/ui/          # shadcn/ui components
├── db/                     # Drizzle schema & client
├── lib/                    # Utilities, auth config, contracts
├── providers/              # React context providers
└── views/                  # Page-level components
```

## Database Schema

- **profiles** — User accounts (email, password, wallet address)
- **organizations** — Studios/gyms with admin ownership
- **organization_instructors** — Instructors per organization
- **classes** — Scheduled classes with capacity
- **bookings** — User class reservations
- **packages** — Purchasable class bundles
- **user_packages** — Purchased packages per user

## License

MIT
