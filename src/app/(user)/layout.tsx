import Navbar from "@/components/nav/Nav";
import Footer from "@/components/Footer";
import AuthCard from "@/components/AuthCard";

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AuthCard />
        </>
    );
}
