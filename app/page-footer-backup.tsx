"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  async function enviarFormulario(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.from("leads").insert([
      {
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono,
        mensaje: form.mensaje,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Error al enviar el formulario");
      console.error(error);
      return;
    }

    alert("Solicitud enviada correctamente");

    setForm({
      nombre: "",
      email: "",
      telefono: "",
      mensaje: "",
    });
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* NAVBAR */}
      <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b">
        <div className="flex items-center">
  <Image
    src="/logo-dms.png"
    alt="DMS Digital Media Studio"
    width={140}
    height={45}
    priority
  />
</div>

        <nav className="hidden md:flex gap-8 text-sm text-gray-600">
          <a href="#inicio">Inicio</a>
          <a href="#servicios">Servicios</a>
          <a href="#planes">Planes</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      {/* HERO */}
      <section
        id="inicio"
        className="flex flex-col items-center text-center px-6 py-24"
      >
        <h1 className="text-4xl md:text-6xl font-bold max-w-4xl">
          Impulsamos negocios con
          <span className="text-purple-600">
            {" "}
            tecnología, marketing e inteligencia artificial
          </span>
        </h1>

        <p className="text-gray-500 mt-6 max-w-2xl">
          Creamos páginas web, automatizaciones, campañas publicitarias y
          estrategias digitales para aumentar tus ventas.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mt-10">
          <a
            href="#contacto"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg"
          >
            Solicitar asesoría
          </a>

          <a
            href="#servicios"
            className="border px-6 py-3 rounded-lg"
          >
            Ver servicios
          </a>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="px-6 md:px-10 py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">
          Nuestros Servicios
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Diseño Web</h3>
            <p className="text-sm text-gray-500">
              Landing pages y sitios corporativos modernos.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Publicidad Digital</h3>
            <p className="text-sm text-gray-500">
              Facebook Ads, Instagram Ads y Google Ads.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Automatización IA</h3>
            <p className="text-sm text-gray-500">
              Chatbots, flujos automáticos y asistentes IA.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2">Redes Sociales</h3>
            <p className="text-sm text-gray-500">
              Gestión de contenido y crecimiento orgánico.
            </p>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="px-6 md:px-10 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Planes para tu negocio
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="border rounded-xl p-6">
            <h3 className="font-bold text-xl">Básico</h3>
            <p className="text-3xl font-bold mt-4">$499.000</p>
          </div>

          <div className="border rounded-xl p-6 border-purple-600">
            <h3 className="font-bold text-xl">Profesional</h3>
            <p className="text-3xl font-bold mt-4">$999.000</p>
          </div>

          <div className="border rounded-xl p-6">
            <h3 className="font-bold text-xl">Empresarial</h3>
            <p className="text-3xl font-bold mt-4">Personalizado</p>
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section
        id="contacto"
        className="px-6 md:px-10 py-20 bg-gray-50"
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Solicita una asesoría
          </h2>

          <form
            onSubmit={enviarFormulario}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Nombre"
              required
              value={form.nombre}
              onChange={(e) =>
                setForm({ ...form, nombre: e.target.value })
              }
              className="w-full border rounded-lg p-3"
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border rounded-lg p-3"
            />

            <input
              type="text"
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(e) =>
                setForm({ ...form, telefono: e.target.value })
              }
              className="w-full border rounded-lg p-3"
            />

            <textarea
              placeholder="Cuéntanos sobre tu proyecto"
              rows={5}
              value={form.mensaje}
              onChange={(e) =>
                setForm({ ...form, mensaje: e.target.value })
              }
              className="w-full border rounded-lg p-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg"
            >
              {loading ? "Enviando..." : "Enviar solicitud"}
            </button>
          </form>
        </div>
      </section>

      <footer className="text-center py-10 text-gray-500 text-sm">
        © 2026 DMS Digital Media Studio. Todos los derechos reservados.
      </footer>
    </main>
  );
}


