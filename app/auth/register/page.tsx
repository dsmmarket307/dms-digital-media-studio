"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (authData.user) {
      const trialStart = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 7);
      await supabase.from("subscriptions").insert({
        user_id: authData.user.id,
        plan: "trial",
        status: "trial",
        trial_start: trialStart.toISOString(),
        trial_end: trialEnd.toISOString(),
      });
    }
    router.push("/dashboard/client");
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image src="/logo-dms.png" alt="DMS Digital Media Studio" width={160} height={52} priority />
        </div>
        <div className="border border-gray-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Crea tu cuenta gratis</h1>
          <p className="text-gray-500 text-sm mb-6">Prueba DMS durante 7 dias y crea tu sitio web con IA, CRM y automatizaciones.</p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="Tu nombre" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electronico</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="tu@correo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contrasena</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-purple-600" placeholder="Minimo 6 caracteres" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50">
              {loading ? "Creando cuenta..." : "Comenzar prueba gratuita"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Ya tienes cuenta?{" "}
            <a href="/auth/login" className="text-purple-600 font-semibold hover:underline">Ingresar</a>
          </p>
        </div>
      </div>
    </main>
  );
}
