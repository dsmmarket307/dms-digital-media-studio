"use client";
import { useEffect } from "react";

interface Props {
  siteId: string;
  pagina: string;
  productoNombre?: string;
}

function getSessionId(): string {
  let id = sessionStorage.getItem("dms_session_id");
  if (!id) {
    id = "s_" + Date.now() + "_" + Math.random().toString(36).slice(2);
    sessionStorage.setItem("dms_session_id", id);
  }
  return id;
}

export default function VisitaTracker({ siteId, pagina, productoNombre }: Props) {
  useEffect(() => {
    const sessionId = getSessionId();

    function enviarHeartbeat() {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          site_id: siteId,
          session_id: sessionId,
          pagina,
          producto_nombre: productoNombre ?? null,
        }),
        keepalive: true,
      }).catch(() => {});
    }

    enviarHeartbeat();
    const interval = setInterval(enviarHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [siteId, pagina, productoNombre]);

  return null;
}