import type { Metadata } from "next";
import Link from "next/link";
import { FileText, AlertTriangle, ExternalLink, ShieldAlert, Award } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Use — BuckShot",
    description:
        "Terms and conditions for utilizing BuckShot, an independent game indexer, deal comparison engine, and community platform.",
};

export default function TermsOfUsePage() {
    return (
        <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20 sm:pt-32 sm:pb-28">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
                {/* ─── Header ─── */}
                <div className="mb-14 sm:mb-20 pb-8 border-b border-[#7a6b4f]/25">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 bg-[#c4a97d] rounded-none shrink-0" />
                        <span className="font-jost text-xs uppercase tracking-[0.25em] text-[#c4a97d]">
                            Legal Agreement &amp; Disclaimers
                        </span>
                    </div>

                    <h1 className="font-jk text-3xl sm:text-4xl md:text-5xl text-[#f4efe4] tracking-tight mb-4">
                        Terms of Use
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-jost text-white/50">
                        <span>Effective Date: October 2026</span>
                        <span>·</span>
                        <span>Platform: BuckShot Gaming Archive</span>
                    </div>
                </div>

                {/* ─── TL;DR Callout Card ─── */}
                <div className="p-6 sm:p-8 bg-[#0d0c0a] border border-[#7a6b4f]/35 mb-14">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 border border-[#7a6b4f]/40 bg-[#7a6b4f]/15 flex items-center justify-center text-[#c4a97d] shrink-0 mt-0.5">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-jk text-lg text-[#f4efe4]">
                                Essential Disclaimers
                            </h3>
                            <p className="font-jost text-sm text-white/70 leading-relaxed font-light">
                                BuckShot is an informational indexer and price comparison platform. We do not sell games, 
                                distribute software binaries, or handle payment processing. All downloads, purchases, and key 
                                redemptions happen directly on third-party storefronts (Steam, Epic, GOG, etc.). We are not 
                                responsible for third-party pricing changes, store policies, or external transactions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── Terms Sections ─── */}
                <div className="space-y-12 font-jost text-white/80 leading-relaxed">
                    {/* Section 1 */}
                    <section className="space-y-3">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">01.</span>
                            Acceptance of Terms
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            By accessing, browsing, or utilizing any feature of BuckShot, you agree to comply with and be 
                            bound by these Terms of Use. If you disagree with any portion of these terms, please discontinue 
                            use of the platform.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-3">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">02.</span>
                            Role as an Independent Indexer
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            BuckShot operates strictly as an informational directory, deal telemetry aggregator, and editorial catalog.
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-white/65 font-light">
                            <li>
                                <strong className="text-white/90">No Direct Commercial Sales:</strong> BuckShot does not sell game 
                                licenses, digital download keys, physical discs, or gift cards. We never ask for or process your financial information.
                            </li>
                            <li>
                                <strong className="text-white/90">No Hosting of Game Files:</strong> We do not host, store, or distribute 
                                downloadable video game executables, cracks, patches, or unauthorized ISO images.
                            </li>
                            <li>
                                <strong className="text-white/90">Indexing Only:</strong> All outgoing download and store buttons direct 
                                visitors to verified third-party retailers and official developer storefronts.
                            </li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-3">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">03.</span>
                            Third-Party Storefronts &amp; Pricing Accuracy
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            While we endeavor to provide real-time price synchronization via automated feeds (including CheapShark), 
                            prices, promotions, bundle contents, and regional availability fluctuate rapidly and without notice.
                        </p>
                        <div className="p-4 bg-[#0d0c0a] border-l-2 border-[#7a6b4f] text-xs sm:text-sm text-white/75 font-light">
                            <strong>Limitation of Responsibility:</strong> BuckShot is not responsible for any price discrepancy, 
                            expired discount, payment failure, refund dispute, or product defect arising from transactions completed 
                            with third-party merchants. Always verify final checkout pricing on the merchant website before completing a purchase.
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-3">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">04.</span>
                            Intellectual Property &amp; Trademarks
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            All video game titles, publisher names, developer logos, cover art, screenshots, trailers, and associated 
                            intellectual properties displayed on this platform are the registered trademarks and copyrights of their 
                            respective owners.
                        </p>
                        <p className="text-sm text-white/65 font-light">
                            Their presentation on BuckShot is strictly for identification, non-commercial indexing, and editorial commentary. 
                            If you are a copyright holder and believe your material has been displayed inappropriately, please reach out via our{" "}
                            <Link href="/contact" className="text-[#c4a97d] underline hover:text-white transition-colors">
                                contact form
                            </Link>{" "}
                            for prompt resolution.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-3">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">05.</span>
                            User Conduct &amp; Community Participation
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            When participating in game comments, discussions, or reviews, users must act in good faith:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-white/65 font-light">
                            <li>No hate speech, harassment, defamation, or personal threats.</li>
                            <li>No distributing links to malware, phishing sites, or pirated software binaries.</li>
                            <li>No abusive automated scraping or Denial of Service attacks targeting our APIs.</li>
                        </ul>
                        <p className="text-sm text-white/65 font-light">
                            We reserve the right to remove offensive comments and revoke account access for abusive behavior.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-3 pt-6 border-t border-white/5">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">06.</span>
                            Disclaimer of Warranties &amp; Limitation of Liability
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            BuckShot is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis as an independent hobby 
                            and freelance showcase. We make no express or implied warranties regarding uninterrupted service, uptime, 
                            or absolute price accuracy. In no event shall the platform owner or administrators be liable for any direct, 
                            indirect, incidental, or consequential damages resulting from your use of the platform.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
