import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles, Layers, ShieldCheck, Database, Cpu, Compass } from "lucide-react";

export const metadata: Metadata = {
    title: "About | BuckShot",
    description:
        "Learn about BuckShot, an independent cinematic PC game catalog, live cross-store price tracker, and community discovery platform.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20 sm:pt-32 sm:pb-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
                {/* ─── Hero Header ─── */}
                <div className="max-w-3xl mb-16 sm:mb-24">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 bg-[#c4a97d] rounded-none shrink-0" />
                        <span className="font-jost text-xs uppercase tracking-[0.25em] text-[#c4a97d]">
                            Manifesto &amp; Platform Architecture
                        </span>
                    </div>

                    <h1 className="font-jk text-4xl sm:text-5xl md:text-6xl text-[#f4efe4] tracking-tight leading-[1.08] mb-6">
                        Archiving Digital Art. <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[#c4a97d] via-[#e8e2d2] to-[#7a6b4f]">
                            Empowering PC Gamers.
                        </span>
                    </h1>

                    <p className="font-jost text-base sm:text-lg text-[#e8e2d2]/70 leading-relaxed font-light">
                        BuckShot was built as a rebuttal to cluttered, ad-saturated gaming storefronts. 
                        It is an independent PC catalog and real-time deal intelligence platform designed 
                        with the restraint, weight, and visual power of a modern AAA game launcher.
                    </p>
                </div>

                {/* ─── Mission Highlights Banner ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#7a6b4f]/20 border border-[#7a6b4f]/30 mb-20">
                    <div className="p-6 sm:p-8 bg-[#0d0c0a]">
                        <span className="font-mono text-2xl sm:text-3xl text-[#c4a97d] font-light">10+</span>
                        <h4 className="font-jk text-base text-[#f4efe4] uppercase tracking-wide mt-2 mb-1">
                            Tracked Storefronts
                        </h4>
                        <p className="font-jost text-xs sm:text-sm text-white/50 leading-normal">
                            Real-time synchronization across Steam, Epic, GOG, Humble, Fanatical, and more.
                        </p>
                    </div>

                    <div className="p-6 sm:p-8 bg-[#0d0c0a]">
                        <span className="font-mono text-2xl sm:text-3xl text-[#c4a97d] font-light">100%</span>
                        <h4 className="font-jk text-base text-[#f4efe4] uppercase tracking-wide mt-2 mb-1">
                            Editorial Independence
                        </h4>
                        <p className="font-jost text-xs sm:text-sm text-white/50 leading-normal">
                            No sponsored rankings, no deceptive dark patterns, and zero intrusive banner ads.
                        </p>
                    </div>

                    <div className="p-6 sm:p-8 bg-[#0d0c0a]">
                        <span className="font-mono text-2xl sm:text-3xl text-[#c4a97d] font-light">0.0s</span>
                        <h4 className="font-jk text-base text-[#f4efe4] uppercase tracking-wide mt-2 mb-1">
                            Bloat &amp; Telemetry
                        </h4>
                        <p className="font-jost text-xs sm:text-sm text-white/50 leading-normal">
                            Only anonymous traffic counters are collected. We respect your privacy by design.
                        </p>
                    </div>
                </div>

                {/* ─── Section 1: What BuckShot Does ─── */}
                <div className="mb-24">
                    <div className="mb-10 sm:mb-12">
                        <span className="font-jost text-xs uppercase tracking-[0.25em] text-[#c4a97d] block mb-2">
                            Core Capabilities
                        </span>
                        <h2 className="font-jk text-3xl sm:text-4xl text-[#f4efe4] tracking-tight">
                            What the Platform Does
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="p-6 sm:p-8 bg-[#0d0c0a] border border-[#7a6b4f]/25 flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 border border-[#7a6b4f]/40 bg-[#7a6b4f]/10 flex items-center justify-center text-[#c4a97d] mb-6">
                                    <Layers className="w-5 h-5" />
                                </div>
                                <h3 className="font-jk text-xl text-[#f4efe4] mb-3">
                                    Cross-Store Deal Intelligence
                                </h3>
                                <p className="font-jost text-sm text-white/60 leading-relaxed">
                                    Video game pricing fluctuates wildly across regional distributors. BuckShot continuously 
                                    monitors official PC storefronts to index historical lows, retail discounts, and bundled deals, 
                                    ensuring you never purchase at full price when a verified discount exists.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/5">
                                <span className="font-jost text-xs text-[#c4a97d] uppercase tracking-wider">
                                    Verified Official Sources Only
                                </span>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="p-6 sm:p-8 bg-[#0d0c0a] border border-[#7a6b4f]/25 flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 border border-[#7a6b4f]/40 bg-[#7a6b4f]/10 flex items-center justify-center text-[#c4a97d] mb-6">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <h3 className="font-jk text-xl text-[#f4efe4] mb-3">
                                    Cinematic Editorial Catalog
                                </h3>
                                <p className="font-jost text-sm text-white/60 leading-relaxed">
                                    Games deserve better than spreadsheets. We treat gaming as digital art, pairing every 
                                    entry with official high-resolution key art, edition breakdowns, system requirements, 
                                    trailer archives, and curated spotlights on standout indie and AAA releases.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/5">
                                <span className="font-jost text-xs text-[#c4a97d] uppercase tracking-wider">
                                    High-Fidelity Media Archives
                                </span>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="p-6 sm:p-8 bg-[#0d0c0a] border border-[#7a6b4f]/25 flex flex-col justify-between">
                            <div>
                                <div className="w-10 h-10 border border-[#7a6b4f]/40 bg-[#7a6b4f]/10 flex items-center justify-center text-[#c4a97d] mb-6">
                                    <Compass className="w-5 h-5" />
                                </div>
                                <h3 className="font-jk text-xl text-[#f4efe4] mb-3">
                                    Community &amp; Discussion
                                </h3>
                                <p className="font-jost text-sm text-white/60 leading-relaxed">
                                    Track titles you care about, save games to your personal wishlist, participate in 
                                    thread discussions, and view verified feedback from players without algorithmic 
                                    manipulation or sponsored bias.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-white/5">
                                <span className="font-jost text-xs text-[#c4a97d] uppercase tracking-wider">
                                    Player-Driven Ecosystem
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Section 2: How It Works Under the Hood ─── */}
                <div className="mb-24 p-8 sm:p-12 bg-[#0d0c0a] border border-[#7a6b4f]/30 relative overflow-hidden">
                    <div className="max-w-2xl mb-12">
                        <span className="font-jost text-xs uppercase tracking-[0.25em] text-[#c4a97d] block mb-2">
                            Technical Pipeline
                        </span>
                        <h2 className="font-jk text-3xl sm:text-4xl text-[#f4efe4] tracking-tight mb-4">
                            How BuckShot Works
                        </h2>
                        <p className="font-jost text-sm sm:text-base text-white/60 leading-relaxed">
                            A look into our architectural philosophy, data ingestion feeds, and how we deliver 
                            lightning-fast catalog exploration.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-none bg-[#7a6b4f]/15 border border-[#7a6b4f]/40 flex items-center justify-center text-[#c4a97d]">
                                    <Database className="w-4 h-4" />
                                </div>
                                <span className="font-mono text-xs text-[#c4a97d]">01 / Ingestion</span>
                            </div>
                            <h4 className="font-jk text-lg text-[#f4efe4]">Automated Store Feeds</h4>
                            <p className="font-jost text-xs sm:text-sm text-white/60 leading-relaxed">
                                We interface with digital platform APIs (including Steam and the CheapShark network) to 
                                track current discounts, retail prices, and regional conversions. Prices update automatically 
                                so you never miss a flash deal.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-none bg-[#7a6b4f]/15 border border-[#7a6b4f]/40 flex items-center justify-center text-[#c4a97d]">
                                    <Cpu className="w-4 h-4" />
                                </div>
                                <span className="font-mono text-xs text-[#c4a97d]">02 / Architecture</span>
                            </div>
                            <h4 className="font-jk text-lg text-[#f4efe4]">Next.js 16 App Router</h4>
                            <p className="font-jost text-xs sm:text-sm text-white/60 leading-relaxed">
                                Built with React 19 Server Components, Turbopack, and Mongoose indexing. Heavy data fetching 
                                resolves server-side with zero client overhead, producing sub-second page loads even on 
                                data-dense game profiles.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-none bg-[#7a6b4f]/15 border border-[#7a6b4f]/40 flex items-center justify-center text-[#c4a97d]">
                                    <ShieldCheck className="w-4 h-4" />
                                </div>
                                <span className="font-mono text-xs text-[#c4a97d]">03 / Indexer Role</span>
                            </div>
                            <h4 className="font-jk text-lg text-[#f4efe4]">Strictly an Indexer</h4>
                            <p className="font-jost text-xs sm:text-sm text-white/60 leading-relaxed">
                                BuckShot does not distribute pirated copies, crack tools, or unauthorized keys. 
                                We act purely as an informative indexing directory directing players to verified, 
                                legitimate storefronts.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── Bottom CTA ─── */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-8 sm:p-10 border border-[#7a6b4f]/25 bg-[#0d0c0a]/60">
                    <div>
                        <h3 className="font-jk text-2xl text-[#f4efe4] mb-2">
                            Ready to Explore the Catalog?
                        </h3>
                        <p className="font-jost text-sm text-white/60">
                            Discover new releases, compare prices across storefronts, and track your library.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <Link
                            href="/store"
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-jost font-semibold tracking-[0.2em] uppercase rounded-none bg-[#7a6b4f] hover:bg-[#c4a97d] text-[#080808] transition-colors duration-200 cursor-pointer"
                        >
                            <span>Browse Store</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 text-xs font-jost font-medium tracking-[0.2em] uppercase rounded-none border border-[#7a6b4f]/40 hover:border-[#c4a97d] text-[#c4a97d] hover:text-white transition-colors duration-200 cursor-pointer"
                        >
                            <span>Contact Admin</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
