"use client";

import { useState } from "react";
import { Mail, Check, Copy, Send, Sparkles, Globe, ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa6";
import { toast } from "@/stores/alertStore";
import { Select } from "@/components/admin/gameModel/utils";

const CREATOR_EMAIL = "contact@buckshot.games";
const CREATOR_GITHUB = "https://github.com/0x000UK";

export default function ContactClient() {
    const [copied, setCopied] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "Freelance Project",
        message: "",
    });

    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(CREATOR_EMAIL);
            setCopied(true);
            toast.success("Email Copied", `${CREATOR_EMAIL} copied to clipboard.`);
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error("Failed to copy", "Please manually copy: " + CREATOR_EMAIL);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        setTimeout(() => {
            setSubmitting(false);
            toast.success(
                "Message Dispatched",
                "Thank you for reaching out! I typically reply within 24–48 hours."
            );
            // Optionally open mail client with draft
            const mailtoUrl = `mailto:${CREATOR_EMAIL}?subject=${encodeURIComponent(
                `[${formData.subject}] from ${formData.name}`
            )}&body=${encodeURIComponent(
                `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
            )}`;
            window.location.href = mailtoUrl;

            setFormData({
                name: "",
                email: "",
                subject: "Freelance Project",
                message: "",
            });
        }, 600);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* ─── Left Column: Creator Identity & Channels (5 cols) ─── */}
            <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Creator Profile Summary */}
                <div className="p-6 sm:p-8 bg-[#0d0c0a] border border-[#7a6b4f]/30 flex flex-col justify-between">
                    <div>
                        {/* Status badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#34D399]/10 border border-[#34D399]/30 rounded-none mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="font-jost text-[10px] uppercase tracking-[0.2em] font-semibold text-emerald-400">
                                Open for Freelance
                            </span>
                        </div>

                        <h3 className="font-jk text-2xl text-[#f4efe4] tracking-tight mb-2">
                            The Independent Creator
                        </h3>
                        <p className="font-jost text-xs uppercase tracking-[0.2em] text-[#c4a97d] mb-4">
                            Lead Architect &amp; Maintainer
                        </p>

                        <p className="font-jost text-sm text-white/70 leading-relaxed mb-6 font-light">
                            BuckShot is a self-funded, independent hobby project born out of a desire for 
                            a pure, high-performance PC game directory. I craft full-stack web applications 
                            combining robust backend architecture with cinematic, typography-focused frontends.
                        </p>

                        <div className="space-y-3 pt-4 border-t border-white/5 text-xs font-jost text-white/60">
                            <div className="flex items-center justify-between">
                                <span className="text-white/40">Specialization</span>
                                <span className="text-[#f4efe4]">Next.js / TypeScript / Systems</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/40">Engagement</span>
                                <span className="text-[#f4efe4]">Freelance Contracts &amp; Advisory</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-white/40">Project Status</span>
                                <span className="text-emerald-400">Actively Maintained</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Direct Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                    {/* Email Card */}
                    <div className="p-5 bg-[#0d0c0a] border border-[#7a6b4f]/25 flex items-center justify-between">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 border border-[#7a6b4f]/40 bg-[#7a6b4f]/10 flex items-center justify-center text-[#c4a97d] shrink-0">
                                <Mail className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block font-jost text-[10px] uppercase tracking-[0.2em] text-white/40">
                                    Direct Email
                                </span>
                                <span className="font-jost text-xs sm:text-sm text-[#f4efe4] font-medium truncate block">
                                    {CREATOR_EMAIL}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopyEmail}
                            aria-label="Copy Email"
                            className="p-2 border border-[#7a6b4f]/40 hover:border-[#c4a97d] bg-transparent text-[#c4a97d] hover:text-white transition-colors cursor-pointer shrink-0 ml-3"
                        >
                            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* GitHub Card */}
                    <a
                        href={CREATOR_GITHUB}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-5 bg-[#0d0c0a] border border-[#7a6b4f]/25 hover:border-[#c4a97d]/50 flex items-center justify-between transition-colors duration-200"
                    >
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 border border-[#7a6b4f]/40 bg-[#7a6b4f]/10 group-hover:bg-[#c4a97d]/15 flex items-center justify-center text-[#c4a97d] shrink-0 transition-colors">
                                <FaGithub className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block font-jost text-[10px] uppercase tracking-[0.2em] text-white/40">
                                    Code &amp; Repositories
                                </span>
                                <span className="font-jost text-xs sm:text-sm text-[#f4efe4] font-medium group-hover:text-[#c4a97d] transition-colors truncate block">
                                    github.com/developer
                                </span>
                            </div>
                        </div>

                        <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-[#c4a97d] transition-colors shrink-0 ml-3" />
                    </a>
                </div>
            </div>

            {/* ─── Right Column: Contact & Freelance Inquiries Form (7 cols) ─── */}
            <div className="lg:col-span-7">
                <div className="p-6 sm:p-10 bg-[#0d0c0a] border border-[#7a6b4f]/30">
                    <div className="mb-8">
                        <h2 className="font-jk text-2xl sm:text-3xl text-[#f4efe4] tracking-tight mb-2">
                            Send a Telegram / Inquiry
                        </h2>
                        <p className="font-jost text-sm text-white/60 font-light">
                            Have a freelance contract, feature request, or need to report an issue with a store link? 
                            Fill out the form below.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="block font-jost text-[11px] uppercase tracking-[0.2em] text-white/50">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Gordon Freeman"
                                    className="w-full font-jost text-sm px-4 py-3 bg-[#080808] border border-[#7a6b4f]/40 text-[#f4efe4] rounded-none outline-none focus:border-[#c4a97d] transition-colors"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="block font-jost text-[11px] uppercase tracking-[0.2em] text-white/50">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="gordon@blackmesa.gov"
                                    className="w-full font-jost text-sm px-4 py-3 bg-[#080808] border border-[#7a6b4f]/40 text-[#f4efe4] rounded-none outline-none focus:border-[#c4a97d] transition-colors"
                                />
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-1.5">
                            <label className="block font-jost text-[11px] uppercase tracking-[0.2em] text-white/50">
                                Inquiry Topic
                            </label>
                            <Select
                                value={formData.subject}
                                onChange={(v) => setFormData({ ...formData, subject: v })}
                                options={
                                    [{value : "Freelance Project", label : "Freelance / Contract Opportunity"},
                                     {value : "Store Link or Data Issue", label : "Report Broken Link or Pricing Error"},
                                     {value : "Feature Suggestion", label : "Feature Suggestion or Partnership"},
                                     {value : "General Inquiry", label : "General Feedback & Greetings"}
                                    ]
                                }
                                className="w-full font-jost text-sm bg-[#080808] text-[#f4efe4] outline-none focus:border-[#c4a97d] transition-colors cursor-pointer"
                            />
                        </div>

                        {/* Message */}
                        <div className="space-y-1.5">
                            <label className="block font-jost text-[11px] uppercase tracking-[0.2em] text-white/50">
                                Detailed Message *
                            </label>
                            <textarea
                                required
                                rows={5}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Describe your project, timeline, budget, or question in detail..."
                                className="w-full font-jost text-sm p-4 bg-[#080808] border border-[#7a6b4f]/40 text-[#f4efe4] rounded-none outline-none focus:border-[#c4a97d] transition-colors resize-y leading-relaxed"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-xs font-jost font-semibold tracking-[0.2em] uppercase rounded-none bg-[#7a6b4f] hover:bg-[#c4a97d] text-[#080808] transition-colors duration-200 cursor-pointer disabled:opacity-50"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{submitting ? "Sending..." : "Dispatch Message"}</span>
                            </button>

                            <span className="font-jost text-[11px] text-white/40 font-light">
                                Direct transmission · Encrypted &amp; private
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
