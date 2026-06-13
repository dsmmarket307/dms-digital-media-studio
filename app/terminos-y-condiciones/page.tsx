import Link from "next/link";
export default function TerminosCondiciones() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b sticky top-0 bg-white z-50">
        <Link href="/" className="font-bold text-lg text-purple-600">DMS Digital Media Studio</Link>
        <Link href="/" className="text-sm text-gray-600 hover:text-purple-600">Volver al inicio</Link>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terminos y Condiciones</h1>
        <p className="text-gray-500 text-sm mb-8">Ultima actualizacion: enero 2026</p>
        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">1. Aceptacion</h2><p>Al usar la plataforma DMS Digital Media Studio usted acepta estos terminos. Si no esta de acuerdo no utilice nuestros servicios.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">2. Descripcion del servicio</h2><p>DMS es una plataforma SaaS que permite crear sitios web con IA, gestionar clientes y automatizar procesos de negocio.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">3. Planes y pagos</h2><p>Los planes se cobran mensualmente. Todos incluyen 7 dias de prueba gratuita. Puede cancelar en cualquier momento sin penalizacion.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">4. Uso aceptable</h2><p>No esta permitido usar la plataforma para actividades ilegales, spam o contenido que viole derechos de terceros.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">5. Propiedad intelectual</h2><p>El contenido generado por el usuario es de su propiedad. DMS se reserva los derechos sobre la plataforma y sus herramientas.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">6. Limitacion de responsabilidad</h2><p>DMS no se hace responsable por perdidas indirectas derivadas del uso de la plataforma.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">7. Contacto</h2><p>Para consultas escribanos a dms.digitalstudio@outlook.com.</p></section>
        </div>
      </div>
      <footer className="border-t py-8 text-center text-sm text-gray-400">2026 DMS Digital Media Studio. Todos los derechos reservados.</footer>
    </div>
  );
}