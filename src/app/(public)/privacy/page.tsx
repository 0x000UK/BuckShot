import type { Metadata } from "next";
import Link from "next/link";
import { Shield, EyeOff, ExternalLink, Database, Lock, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy | BuckShot",
    description:
        "BuckShot's privacy policy. Learn about our minimal telemetry, traffic monitoring, and strict commitment to user privacy.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20 sm:pt-32 sm:pb-28">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
                {/* ─── Header ─── */}
                <div className="mb-14 sm:mb-20 pb-8 border-b border-[#7a6b4f]/25">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 bg-[#c4a97d] rounded-none shrink-0" />
                        <span className="font-jost text-xs uppercase tracking-[0.25em] text-[#c4a97d]">
                            Legal &amp; Transparency
                        </span>
                    </div>

                    <h1 className="font-jk text-3xl sm:text-4xl md:text-5xl text-[#f4efe4] tracking-tight mb-4">
                        Privacy Policy
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-xs font-jost text-white/50">
                        <span>Effective Date: October 2026</span>
                        <span>·</span>
                        <span>Last Revision: Current Version</span>
                    </div>
                </div>

                {/* ─── TL;DR Callout Card ─── */}
                <div className="p-6 sm:p-8 bg-[#0d0c0a] border border-[#7a6b4f]/35 mb-14">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 border border-[#7a6b4f]/40 bg-[#7a6b4f]/15 flex items-center justify-center text-[#c4a97d] shrink-0 mt-0.5">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="font-jk text-lg text-[#f4efe4]">
                                Plain Language Summary
                            </h3>
                            <p className="font-jost text-sm text-white/70 leading-relaxed font-light">
                                BuckShot collects only minimal, anonymous visit data to monitor site traffic, server load, 
                                and popular storefront clicks. We do not sell user data, track you across the web, or run 
                                behavioral advertising. External storefronts we index (Steam, Epic, GOG, etc.) have their own 
                                independent privacy policies once you leave BuckShot.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── Policy Sections ─── */}
                <div className="space-y-12 font-jost text-white/80 leading-relaxed">
                    {/* Section 1 */}
                    <section className="space-y-3">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">01.</span>
                            Information We Collect
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            We believe in data minimization. We only collect the information strictly necessary to operate, 
                            secure, and maintain the performance of the platform:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-white/65 font-light">
                            <li>
                                <strong className="text-white/90">Anonymous Traffic Telemetry:</strong> Standard server logs, 
                                aggregated page visit counters, referrers, and outbound download link clicks. This data is non-personal 
                                and used solely to monitor infrastructure health, server capacity, and catalog interest.
                            </li>
                            <li>
                                <strong className="text-white/90">User Account Data (Optional):</strong> If you choose to register 
                                or sign in using NextAuth (OAuth/Credentials), we store your profile identifier, email address, chosen handle, 
                                and avatar to power your profile, comments, and personal wishlist.
                            </li>
                            <li>
                                <strong className="text-white/90">User-Generated Content:</strong> Comments, discussion replies, 
                                and game ratings you voluntarily submit to the public catalog.
                            </li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-3">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">02.</span>
                            What We Never Collect
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            BuckShot does not engage in invasive tracking. We do NOT:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-white/65 font-light">
                            <li>Collect or store payment information, credit card numbers, or billing addresses.</li>
                            <li>Sell, lease, or monetize your personal information to third-party data brokers.</li>
                            <li>Deploy third-party ad networks or behavioral cross-site tracking pixels.</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-3">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">03.</span>
                            Third-Party Links &amp; External Storefronts
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            BuckShot is an indexing catalog. When you click download, purchase, or store buttons, you are 
                            directed to external third-party digital storefronts (such as Steam, Epic Games Store, GOG, 
                            Humble Bundle, or publisher websites), media embeds (YouTube), or image CDNs (Cloudinary).
                        </p>
                        <div className="p-4 bg-[#0d0c0a] border-l-2 border-[#c4a97d] text-xs sm:text-sm text-white/75 font-light">
                            <strong>Important Notice:</strong> We have no control over and assume no responsibility for 
                            the content, privacy policies, cookies, or practices of any third-party websites or services. 
                            We encourage you to review the privacy policy of every external site you visit.
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-3">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">04.</span>
                            Cookies &amp; Local Storage
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            We use cookies and browser storage strictly for functional purposes:
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-white/65 font-light">
                            <li>
                                <strong className="text-white/90">Authentication Tokens:</strong> Secure HTTP-only session cookies 
                                to keep you authenticated across page visits.
                            </li>
                            <li>
                                <strong className="text-white/90">UI Preferences:</strong> Client-side storage for interface states 
                                such as filter preferences and theme settings.
                            </li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-3">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">05.</span>
                            Data Security &amp; Retention
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            We implement industry-standard safeguards, including encrypted HTTPS transmission, secure credential hashing, 
                            and hardened MongoDB access controls. We retain account data for as long as your account is active. 
                            You may request account deletion at any time by reaching out through our contact page.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-3 pt-6 border-t border-white/5">
                        <h2 className="font-jk text-xl sm:text-2xl text-[#f4efe4] tracking-wide flex items-center gap-3">
                            <span className="font-mono text-sm text-[#c4a97d]">06.</span>
                            Contact for Privacy Matters
                        </h2>
                        <p className="text-sm sm:text-base text-white/70 font-light">
                            If you have questions about this policy, want to request deletion of your account, or wish to report 
                            a security concern, please reach out via our{" "}
                            <Link href="/contact" className="text-[#c4a97d] underline hover:text-white transition-colors">
                                Contact &amp; Creator Directory
                            </Link>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
