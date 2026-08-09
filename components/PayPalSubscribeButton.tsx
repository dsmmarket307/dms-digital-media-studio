"use client";
import { useEffect, useRef, useState } from "react";

const PAYPAL_PLAN_IDS: Record<string, string> = {
  basico: "P-0CW85817DH932030JNJ33SZA",
  profesional: "P-4CL43917S45154727NJ33V7Y",
  empresarial: "P-2A983314C4136215ANJ33XPI",
};

declare global {
  interface Window {
    paypal?: any;
  }
}

let sdkLoadPromise: Promise<void> | null = null;

function loadPayPalSdk(clientId: string): Promise<void> {
  if (window.paypal) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;
  sdkLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar el SDK de PayPal"));
    document.body.appendChild(script);
  });
  return sdkLoadPromise;
}

export default function PayPalSubscribeButton({
  planSlug,
  userId,
  onSuccess,
}: {
  planSlug: string;
  userId: string;
  onSuccess: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"cargando" | "listo" | "procesando" | "error">("cargando");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const planId = PAYPAL_PLAN_IDS[planSlug];
    if (!clientId || !planId || !containerRef.current) {
      setStatus("error");
      setErrorMsg("Configuracion de PayPal incompleta.");
      return;
    }

    let cancelled = false;

    loadPayPalSdk(clientId)
      .then(() => {
        if (cancelled || !containerRef.current || !window.paypal) return;
        containerRef.current.innerHTML = "";
        window.paypal
          .Buttons({
            style: { shape: "rect", color: "gold", layout: "vertical", label: "paypal" },
            createSubscription: (_data: any, actions: any) => {
              return actions.subscription.create({ plan_id: planId });
            },
            onApprove: async (data: any) => {
              setStatus("procesando");
              try {
                const res = await fetch("/api/paypal/activar-suscripcion", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    subscription_id: data.subscriptionID,
                    user_id: userId,
                    plan: planSlug,
                  }),
                });
                const result = await res.json();
                if (result.ok) {
                  onSuccess();
                } else {
                  setStatus("error");
                  setErrorMsg(result.error ?? "No se pudo activar la suscripcion.");
                }
              } catch {
                setStatus("error");
                setErrorMsg("Error de conexion al activar la suscripcion.");
              }
            },
            onError: () => {
              setStatus("error");
              setErrorMsg("Ocurrio un error con PayPal. Intenta de nuevo.");
            },
          })
          .render(containerRef.current);
        setStatus("listo");
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("No se pudo cargar PayPal.");
      });

    return () => {
      cancelled = true;
    };
  }, [planSlug, userId, onSuccess]);

  return (
    <div>
      {status === "cargando" && <p style={{ fontSize: 12, color: "#888", textAlign: "center" }}>Cargando PayPal...</p>}
      {status === "procesando" && <p style={{ fontSize: 12, color: "#7c3aed", fontWeight: 700, textAlign: "center" }}>Activando tu suscripcion...</p>}
      {status === "error" && <p style={{ fontSize: 12, color: "#ef4444", textAlign: "center" }}>{errorMsg}</p>}
      <div ref={containerRef} style={{ display: status === "procesando" ? "none" : "block" }} />
    </div>
  );
}
