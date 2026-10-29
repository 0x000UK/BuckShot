

export const metadata = { title: "Category" }

export default async function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="mt-10">
        {children}
    </div>
  );
}