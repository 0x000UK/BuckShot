import Image from 'next/image'

export const metadata = { title: "Library" }

export default function StoreLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="mt-22">
            <div className="relative w-full h-32 max-w-7xl mx-auto overflow-hidden flex items-center justify-center border border-[#7a6b4f]/15">

                {/* <Image 
                    src={""}
                    alt="bg"
                    fill
                    className="object-cover priority"
                /> */}

                {/* 2. Cinematic Dark Gradient Overlay */}
                <div className="absolute inset-0 z-1 bg-linear-to-r from-[#080808]/95 via-[#080808]/60 to-transparent pointer-events-none" />
                <div className="absolute inset-0 z-1 bg-linear-to-t from-[#080808]/80 via-transparent to-transparent pointer-events-none" />

                <div className="text-[18px] relative z-2">
                    <span>LIBRARY</span>
                </div>

            </div>
            {children}
        </div>
    )
}