"use client";
import { usePathname } from "next/navigation";
import ClientSidebar from "@/components/ClientSidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditor = pathname === "/dashboard/client/builder";

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1 }}>
        {!isEditor && <ClientSidebar />}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
