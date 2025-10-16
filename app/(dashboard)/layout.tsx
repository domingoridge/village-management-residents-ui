import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <MobileNav />
      <main className="min-h-[calc(100vh-4rem)] p-4 md:ml-64 md:p-6">
        {children}
      </main>
    </div>
  );
}
