import { Button } from "@/components/ui/legacy/button";
import { useAuthContext } from "@/providers/AuthProvider";

function ListYourStudioCTA() {
  return (
    <div className="border border-zinc-800 p-8 max-w-2xl">
      <p className="text-xs tracking-[0.25em] text-zinc-500 uppercase font-mono mb-3">For Studios</p>
      <h3 className="text-xl font-bold text-white mb-2">
        List your classes on Movemint
      </h3>
      <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
        Instant crypto settlements. No 30-day payout cycles. Reach wallet-native fitness enthusiasts.
      </p>
      <Button
        variant="outline"
        className="border-white text-white bg-transparent hover:bg-white hover:text-black rounded-none font-mono text-xs tracking-widest uppercase px-6"
        onClick={() => (window.location.href = "/create-organization")}
      >
        Apply Now →
      </Button>
    </div>
  );
}

export default function Hero() {
  const { user } = useAuthContext();

  return (
    <section className="bg-black text-white min-h-screen flex items-center border-b border-zinc-900">
      <div className="container mx-auto px-6 py-24">
        <div className="max-w-5xl">
          <p className="text-xs tracking-[0.35em] text-zinc-500 uppercase mb-10 font-mono">
            Crypto-native fitness — Base Network
          </p>

          <h1 className="text-8xl md:text-[10rem] font-black uppercase tracking-tighter leading-none mb-10 text-white">
            MOVE<br />MINT
          </h1>

          <p className="text-zinc-400 text-lg max-w-lg mb-12 leading-relaxed">
            Book classes from top studios. Pay in crypto.
            Earn <span className="text-white font-mono">$MOVE</span> tokens for every session you complete.
          </p>

          <div className="flex flex-wrap gap-4 mb-24">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-zinc-200 rounded-none font-mono text-xs tracking-widest uppercase px-8"
              onClick={() => {
                document.getElementById("classes")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Browse Classes
            </Button>

            {user ? (
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 text-white bg-transparent hover:bg-zinc-900 rounded-none font-mono text-xs tracking-widest uppercase px-8"
                onClick={() => (window.location.href = "/dashboard")}
              >
                Dashboard
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                className="border-zinc-700 text-white bg-transparent hover:bg-zinc-900 rounded-none font-mono text-xs tracking-widest uppercase px-8"
                onClick={() => (window.location.href = "/login")}
              >
                Connect →
              </Button>
            )}
          </div>

          <ListYourStudioCTA />
        </div>
      </div>
    </section>
  );
}
