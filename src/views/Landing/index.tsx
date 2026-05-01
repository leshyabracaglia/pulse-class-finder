import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "Discover",
    body: "Browse fitness classes from top studios — yoga, HIIT, cycling, pilates, and more. Filter by location, time, and instructor.",
  },
  {
    num: "02",
    title: "Book & Pay",
    body: "Reserve your spot and pay directly to the studio in crypto. Instant on-chain settlement. No intermediaries, no delays.",
  },
  {
    num: "03",
    title: "Earn",
    body: "Complete a class and earn $SLST tokens. Build your on-chain fitness record and get rewarded for showing up.",
  },
];

const stats = [
  { label: "Settlement", value: "Instant" },
  { label: "Network", value: "Base" },
  { label: "Platform Fee", value: "None" },
  { label: "Payout Cycle", value: "Real-time" },
];

export default function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Solstice",
            applicationCategory: "HealthApplication",
            description:
              "Crypto-native fitness class booking platform. Book classes from top studios, pay in crypto on Base Network, and earn $SLST tokens for every session.",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-zinc-900">
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-black text-white tracking-tighter text-base uppercase">
            Solstice
          </span>
          <div className="flex items-center gap-5">
            <Link
              href="/login"
              className="text-xs font-mono tracking-widest uppercase text-zinc-400 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/login"
              className="text-xs font-mono tracking-widest uppercase bg-white text-black px-5 py-2 hover:bg-zinc-200 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center border-b border-zinc-900 pt-14">
        <div className="container mx-auto px-6 py-32">
          <div className="max-w-5xl">
            <p className="text-xs tracking-[0.35em] text-zinc-500 uppercase font-mono mb-10">
              Crypto-native fitness — Base Network
            </p>
            <h1 className="text-8xl md:text-[11rem] font-black uppercase tracking-tighter leading-none mb-10 text-white">
              SOL
              <br />
              STICE
            </h1>
            <p className="text-zinc-400 text-lg max-w-lg mb-12 leading-relaxed font-display">
              Discover and book fitness classes from the best studios. Pay in
              crypto. Earn{" "}
              <span className="text-white font-mono">$SLST</span> tokens for
              every session you complete.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="bg-white text-black font-mono text-xs tracking-widest uppercase px-8 py-4 hover:bg-zinc-200 transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/login"
                className="border border-zinc-700 text-white font-mono text-xs tracking-widest uppercase px-8 py-4 hover:bg-zinc-900 transition-colors"
              >
                Log In →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-zinc-900 py-32">
        <div className="container mx-auto px-6">
          <p className="text-xs tracking-[0.25em] text-zinc-500 uppercase font-mono mb-16">
            How It Works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 border border-zinc-900">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`p-10 ${
                  i < 2
                    ? "border-b border-zinc-900 md:border-b-0 md:border-r md:border-zinc-900"
                    : ""
                }`}
              >
                <p className="text-xs font-mono text-zinc-700 mb-6">
                  {step.num}
                </p>
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-display">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Studios */}
      <section className="border-b border-zinc-900 py-32">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <div>
              <p className="text-xs tracking-[0.25em] text-zinc-500 uppercase font-mono mb-6">
                For Studios
              </p>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
                Get paid
                <br />
                instantly.
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed font-display mb-10 max-w-md">
                No 30-day payout cycles. No percentage taken. Crypto payments
                settle directly to your studio wallet the moment a class is
                booked. Reach a growing community of wallet-native fitness
                enthusiasts.
              </p>
              <Link
                href="/create-organization"
                className="border border-white text-white font-mono text-xs tracking-widest uppercase px-6 py-3 hover:bg-white hover:text-black transition-colors inline-block"
              >
                Apply Now →
              </Link>
            </div>
            <div className="flex flex-col gap-px bg-zinc-900 border border-zinc-900">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="bg-black px-8 py-6 flex justify-between items-center"
                >
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                    {item.label}
                  </span>
                  <span className="text-sm font-mono text-white">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="border-b border-zinc-900 py-24">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white mb-2">
              Ready to move?
            </h2>
            <p className="text-zinc-500 text-sm font-display">
              Create an account or connect your wallet to get started.
            </p>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <Link
              href="/login"
              className="bg-white text-black font-mono text-xs tracking-widest uppercase px-8 py-4 hover:bg-zinc-200 transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              href="/create-organization"
              className="border border-zinc-700 text-white font-mono text-xs tracking-widest uppercase px-8 py-4 hover:bg-zinc-900 transition-colors"
            >
              List Your Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <p className="font-black text-white tracking-tighter text-base uppercase mb-3">
                Solstice
              </p>
              <p className="text-zinc-500 max-w-sm text-sm leading-relaxed font-display">
                Crypto-native fitness booking. Instant studio settlements. Earn{" "}
                <span className="text-white font-mono">$SLST</span> tokens for
                every class you attend.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-mono tracking-[0.25em] text-zinc-600 uppercase mb-5">
                Platform
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/login"
                    className="text-xs text-zinc-400 hover:text-white transition-colors font-mono"
                  >
                    Log In
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-xs text-zinc-400 hover:text-white transition-colors font-mono"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-mono tracking-[0.25em] text-zinc-600 uppercase mb-5">
                Studios
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/create-organization"
                    className="text-xs text-zinc-400 hover:text-white transition-colors font-mono"
                  >
                    List Your Studio
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-mono text-zinc-700 tracking-widest uppercase">
              Solstice
            </p>
            <p className="text-xs font-mono text-zinc-700">
              © {new Date().getFullYear()} Solstice. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
