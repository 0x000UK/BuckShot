export const metadata = { title: "Store" }

export default function StoreLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="mt-10">
            {children}
        </div>
    )
}