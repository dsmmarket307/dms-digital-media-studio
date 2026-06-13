import Link from "next/link";
export default function TratamientoDatos() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b sticky top-0 bg-white z-50">
        <Link href="/" className="font-bold text-lg text-purple-600">DMS Digital Media Studio</Link>
        <Link href="/" className="text-sm text-gray-600 hover:text-purple-600">Volver al inicio</Link>
      </header>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tratamiento de Datos Personales</h1>
        <p className="text-gray-500 text-sm mb-8">Ultima actualizacion: enero 2026</p>
        <div className="space-y-8 text-gray-600 text-sm leading-relaxed">
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">1. Responsable del tratamiento</h2><p>DMS Digital Media Studio, con domicilio en Pereira, Colombia, es responsable del tratamiento de sus datos personales.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">2. Datos recopilados</h2><p>Recopilamos nombre, correo electronico, numero de telefono, datos del negocio e informacion de uso de la plataforma.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">3. Finalidad del tratamiento</h2><p>Sus datos se usan para prestar los servicios contratados, enviar comunicaciones comerciales con su consentimiento, mejorar la plataforma y cumplir obligaciones legales.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">4. Base legal</h2><p>El tratamiento se basa en la Ley 1581 de 2012 de Proteccion de Datos Personales de Colombia y su decreto reglamentario 1377 de 2013.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">5. Derechos del titular</h2><p>Usted tiene derecho a conocer, actualizar, rectificar y suprimir sus datos. Para ejercerlos escriba a dms.digitalstudio@outlook.com.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">6. Transferencia de datos</h2><p>No transferimos sus datos a terceros sin su autorizacion, salvo obligacion legal.</p></section>
          <section><h2 className="text-lg font-bold text-gray-900 mb-2">7. Vigencia</h2><p>Sus datos se conservan mientras mantenga una relacion activa con DMS o mientras sea necesario por obligaciones legales.</p></section>
        </div>
      </div>
      <footer className="border-t py-8 text-center text-sm text-gray-400">2026 DMS Digital Media Studio. Todos los derechos reservados.</footer>
    </div>
  );
}