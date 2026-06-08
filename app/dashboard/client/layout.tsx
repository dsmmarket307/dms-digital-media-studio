"use client";
import ClientSidebar from "@/components/ClientSidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1 }}>
        <ClientSidebar />
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
