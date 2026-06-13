import Link from "next/link";
export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b sticky top-0 bg-white z-50">
        <Link href="/" className="font-bold text-lg text-purple-600">DMS Digital Media Studio</Link>
        <Link href="/" className="text-sm text-gray-600 hover:text-purple-600">Volver al inicio</Link>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Politica de Privacidad</h1>
        <p className="text-gray-500 text-sm mb-8">Ultima actualizacion: enero 2026</p>
        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">1. Informacion que recopilamos</h2><p>Recopilamos nombre, correo electronico, telefono y datos del negocio al registrarse o contactarnos.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">2. Uso de la informacion</h2><p>Utilizamos su informacion para proveer nuestros servicios, procesar pagos y mejorar la plataforma. No vendemos su informacion a terceros.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">3. Seguridad</h2><p>Implementamos cifrado SSL y almacenamiento seguro para proteger su informacion.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">4. Cookies</h2><p>Usamos cookies para mejorar su experiencia. Puede desactivarlas desde su navegador.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">5. Sus derechos</h2><p>Puede acceder, corregir o eliminar su informacion escribiendo a dms.digitalstudio@outlook.com.</p></section>
        </div>
      </div>
      <footer className="border-t py-8 text-center text-sm text-gray-400">2026 DMS Digital Media Studio. Todos los derechos reservados.</footer>
    </div>
  );
}