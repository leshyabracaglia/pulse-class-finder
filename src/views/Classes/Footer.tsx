const Footer = () => {
  return (
    <footer className="bg-black border-t border-zinc-900 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <p className="text-xs tracking-[0.35em] text-zinc-500 uppercase font-mono mb-4">Solstice</p>
            <p className="text-zinc-500 max-w-md text-sm leading-relaxed font-display">
              Crypto-native fitness booking. Instant studio settlements.
              Earn <span className="text-white font-mono">$SLST</span> tokens for every class you attend.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono tracking-[0.25em] text-zinc-500 uppercase mb-6">
              Navigate
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">Dashboard</a>
              </li>
              <li>
                <a href="/" className="text-zinc-400 hover:text-white transition-colors">Classes</a>
              </li>
              <li>
                <a href="/profile" className="text-zinc-400 hover:text-white transition-colors">Profile</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono tracking-[0.25em] text-zinc-500 uppercase mb-6">
              Studios
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="/create-organization" className="text-zinc-400 hover:text-white transition-colors">List Your Studio</a>
              </li>
              <li>
                <a href="#" className="text-zinc-400 hover:text-white transition-colors">Support</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-mono text-zinc-600 tracking-widest uppercase">
            Solstice
          </p>
          <p className="text-xs font-mono text-zinc-700">
            © {new Date().getFullYear()} Solstice. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
