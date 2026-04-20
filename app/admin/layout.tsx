import Link from "next/link";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false }
};

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="bg-ink text-paper -mx-6 px-6 py-3 mb-8 -mt-10 rounded-b-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm">
          <div className="flex gap-6">
            <Link href="/admin" className="font-bold">
              Panel
            </Link>
            <Link href="/admin/nuevo-libro" className="hover:opacity-80">
              + Nuevo libro
            </Link>
          </div>
          <span className="opacity-60">Modo administración</span>
        </div>
      </div>
      {children}
    </div>
  );
}
