"use client";
import Link from "next/link";

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Pago no completado</h1>
        <p className="text-gray-500 mb-8">Tu pago no fue procesado. No se hizo ningun cobro. Puedes intentarlo nuevamente.</p>
        <div className="space-y-3">
          <Link href="/planes" className="block w-full bg-purple-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-purple-700 transition-colors">
            Intentar nuevamente
          </Link>
          <Link href="/" className="block w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors">
            Volver al inicio
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-6">
          Necesitas ayuda? Escríbenos a{" "}
          <a href="mailto:dms.digitalstudio@outlook.com" className="text-purple-600 hover:underline">
            dms.digitalstudio@outlook.com
          </a>
        </p>
      </div>
    </div>
  );
}