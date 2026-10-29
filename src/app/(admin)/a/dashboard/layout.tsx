import Sidebar from "@/components/admin/Sidebar";
import { TopBar } from "@/components/admin/TopBar";
import { Suspense } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard" };

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	if (!session || session.user.role !== "admin") {
		redirect("/");
	}

	return (
		<div className="flex h-screen bg-[#080808] text-white overflow-hidden selection:bg-[#7a6b4f]/30">
			<Sidebar />
			{/* Main Content Pane */}
			<div className="flex flex-col flex-1 min-w-0">
				{/* Header Area */}
				<Suspense fallback={<div className="h-14 border-b border-[#7a6b4f]/20 bg-[#080808]" />}>
					<TopBar />
				</Suspense>

				{/* Scrollable View Area */}
				<div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#7a6b4f]/30 scrollbar-track-transparent">
					{children}
				</div>
			</div>
		</div>
	);
}