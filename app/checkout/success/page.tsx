"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useEffect, useState } from "react";

function SuccessContent() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id");
  const status = params.get("status");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (paymentId && status === "approved" && !saved) {
      setSaved(true);
      fetch("/api/mercadopago/procesar-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: paymentId }),
      }).catch(console.error);
    }
  }, [paymentId, status]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Pago recibido</h1>
        <p className="text-gray-500 mb-8">Tu pago fue procesado correctamente. Pronto nuestro equipo se pondra en contacto contigo.</p>
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 mb-8 text-left space-y-3">
          <h2 className="font-bold text-gray-900 mb-4">Proximos pasos</h2>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
            <p className="text-sm text-gray-600">Recibiras un correo de confirmacion en los proximos minutos.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
            <p className="text-sm text-gray-600">Nuestro equipo revisara tu pedido y te contactara en menos de 24 horas.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
            <p className="text-sm text-gray-600">Comenzaremos a trabajar en tu proyecto segun los tiempos acordados.</p>
          </div>
        </div>
        {paymentId && (
          <p className="text-xs text-gray-400 mb-6">ID de pago: {paymentId}</p>
        )}
        <Link href="/" className="block w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors">
          Volver al inicio
        </Link>
        <p className="text-sm text-gray-400 mt-4">
          Tienes dudas? Escribenos a{" "}
          <a href="mailto:dms.digitalstudio@outlook.com" className="text-purple-600 hover:underline">
            dms.digitalstudio@outlook.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
