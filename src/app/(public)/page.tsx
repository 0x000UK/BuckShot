import Hero from "@/components/home/Hero";
import GenresSection from "@/components/home/genreSection";
import NewReleases from "@/components/home/NewReleases";
import Updated from "@/components/home/Updated";
import Trending from "@/components/home/Trending";
import Featured from "@/components/home/Featured";
import Exclusive from "@/components/home/Exclusive";
import Upcoming from "@/components/home/Upcoming";

export default function HomePage() {
    return (
        <div className="relative bg-[#080808] text-white">
            <Hero />
            <NewReleases />
            <Updated />
            <Trending />
            <Featured />
            <Exclusive />
            <GenresSection />
            <Upcoming />
        </div>
    );
}
