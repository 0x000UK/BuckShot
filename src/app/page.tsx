import Footer from "@/components/Footer";
import PublicSection from "@/components/home/PublicSection";
import Nav from "@/components/Nav";

export default function Home() {
	return (
		<div className="relative bg-[#080808] text-white">
			<Nav/>
			<PublicSection/>
			<Footer/>
		</div>
	);
}
