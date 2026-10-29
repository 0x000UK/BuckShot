import type { Metadata } from "next";
import {JetBrains_Mono , Plus_Jakarta_Sans, Jost} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";
import { AlertStack } from "@/components/Toast";
import AnalyticsTracker from "@/components/shared/AnalyticsTracker";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});
const jakartasans = Plus_Jakarta_Sans({variable : '--font-jk'})
const jost = Jost({variable: '--font-jost'})


export const metadata: Metadata = {
	title: "Games Store",
	description: "Store of repacked games",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={cn("bg-[#080808]","h-full", "antialiased", jetbrainsMono.variable, jakartasans.variable, jost.variable)}
		>
			<body className="min-h-full flex flex-col [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
				<SessionProvider>
					<AnalyticsTracker />
					{children}
					<AlertStack/>
				</SessionProvider>
			</body>
		</html>
	);
}
