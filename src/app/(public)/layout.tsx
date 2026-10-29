import Navbar from "@/components/nav/Nav";
import Footer from "@/components/Footer";
import AuthCard from "@/components/AuthCard";

export default function PublicLayout({ children } :  Readonly<{
	children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <AuthCard/>
        </>
    );
}