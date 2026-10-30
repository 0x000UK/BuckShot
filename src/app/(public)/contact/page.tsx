import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
    title: "Contact | BuckShot",
    description:
        "Connect with the independent creator behind BuckShot for freelance inquiries, contract development, platform feedback, and bug reports.",
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20 sm:pt-32 sm:pb-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
                {/* ─── Hero Header ─── */}
                <div className="max-w-3xl mb-14 sm:mb-20">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="w-1.5 h-1.5 bg-[#c4a97d] rounded-none shrink-0" />
                        <span className="font-jost text-xs uppercase tracking-[0.25em] text-[#c4a97d]">
                            Creator &amp; Inquiries
                        </span>
                    </div>

                    <h1 className="font-jk text-4xl sm:text-5xl md:text-6xl text-[#f4efe4] tracking-tight leading-[1.08] mb-6">
                        Built by an <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-[#c4a97d] via-[#e8e2d2] to-[#7a6b4f]">
                            Independent Developer.
                        </span>
                    </h1>

                    <p className="font-jost text-base sm:text-lg text-[#e8e2d2]/70 leading-relaxed font-light">
                        BuckShot is maintained as a passionate freelance and hobby engineering project. 
                        Whether you are looking to hire a full-stack engineer for custom web builds, want to 
                        report an outdated deal link, or just talk games, my inbox is open.
                    </p>
                </div>

                {/* ─── Interactive Contact Client ─── */}
                <ContactClient />
            </div>
        </div>
    );
}
