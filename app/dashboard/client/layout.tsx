"use client";
import { usePathname } from "next/navigation";
import ClientSidebar from "@/components/ClientSidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditor = pathname === "/dashboard/client/builder";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      <style>{`
        .client-wrapper { display: flex; flex-direction: row; min-height: 100vh; }
        .client-main { flex: 1; min-width: 0; }
        @media (max-width: 768px) {
          .client-wrapper { flex-direction: column; }
        }
      `}</style>
      <div className="client-wrapper">
        {!isEditor && <ClientSidebar />}
        <main className="client-main">
          {children}
        </main>
      </div>
    </div>
  );
}
