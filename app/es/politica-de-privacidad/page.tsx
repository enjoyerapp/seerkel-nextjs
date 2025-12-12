
export default function PoliticaPrivacidad() {
  return (
    <div className="w-full h-full overflow-y-auto bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          Política de Privacidad
        </h1>

        <div className="space-y-8">
          <PolicySection
            title="Recopilación y uso de datos"
            content={
              <>
                <p className="mb-4 leading-relaxed">
                  En nuestra landing page, no se requiere registro ni inicio de sesión. Sin embargo, 
                  podemos recopilar información de manera automática o cuando interactúas con el sitio, 
                  incluyendo:
                </p>
                <ul className="list-disc list-inside space-y-3 ml-4 mb-4">
                  <li className="leading-relaxed">
                    <strong className="text-[#fbdf85]">Información de contacto proporcionada voluntariamente:</strong> 
                    {' '}como tu correo electrónico si te suscribes a nuestro boletín, rellenas un formulario 
                    de contacto o solicitas más información sobre nuestros servicios.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-[#fbdf85]">Datos de navegación:</strong> 
                    {' '}páginas visitadas, secciones consultadas, enlaces clicados y tiempo de permanencia 
                    en el sitio.
                  </li>
                  <li className="leading-relaxed">
                    <strong className="text-[#fbdf85]">Información técnica y del dispositivo:</strong> 
                    {' '}dirección IP, tipo de dispositivo, sistema operativo, navegador y marcas de tiempo 
                    de acceso. Esta información nos ayuda a garantizar la seguridad del sitio, optimizar su 
                    rendimiento y mejorar la experiencia del usuario.
                  </li>
                </ul>
              </>
            }
          />

          <PolicySection
            title="Uso de la información"
            content={
              <>
                <p className="mb-4 leading-relaxed">
                  Los datos recopilados se utilizan únicamente con los siguientes fines:
                </p>
                <ul className="list-disc list-inside space-y-3 ml-4">
                  <li className="leading-relaxed">
                    Analizar el tráfico y comportamiento en la landing page para mejorar su diseño, 
                    contenido y funcionalidad.
                  </li>
                  <li className="leading-relaxed">
                    Responder a tus consultas o solicitudes de información si proporcionaste tu correo 
                    electrónico u otros datos de contacto.
                  </li>
                  <li className="leading-relaxed">
                    Enviar comunicaciones relevantes, como boletines informativos, únicamente si has dado 
                    tu consentimiento.
                  </li>
                  <li className="leading-relaxed">
                    Garantizar la seguridad y el correcto funcionamiento de la página.
                  </li>
                </ul>
              </>
            }
          />

          <PolicySection
            title="Compartir información con terceros"
            content={
              <>
                <p className="mb-4 leading-relaxed">
                  No vendemos ni compartimos información personal con terceros, excepto cuando sea 
                  necesario para:
                </p>
                <ul className="list-disc list-inside space-y-3 ml-4">
                  <li className="leading-relaxed">Cumplir con obligaciones legales.</li>
                  <li className="leading-relaxed">Proteger la seguridad del sitio o de sus usuarios.</li>
                  <li className="leading-relaxed">
                    Procesar solicitudes o servicios que tú hayas autorizado (por ejemplo, proveedores 
                    de correo para boletines).
                  </li>
                </ul>
              </>
            }
          />

          <PolicySection
            title="Derechos de Privacidad"
            content={
              <>
                <p className="mb-4 leading-relaxed">
                  De acuerdo con la normativa aplicable (como GDPR y CCPA), tienes derecho a:
                </p>
                <ul className="list-disc list-inside space-y-3 ml-4 mb-4">
                  <li className="leading-relaxed">Acceder a los datos que recopilamos sobre ti.</li>
                  <li className="leading-relaxed">Solicitar la eliminación de tus datos personales.</li>
                  <li className="leading-relaxed">
                    Retirar tu consentimiento para recibir comunicaciones en cualquier momento.
                  </li>
                </ul>
                <p className="mb-4 leading-relaxed">
                  Para ejercer estos derechos, puedes contactarnos a través del correo{' '}
                  <a 
                    href="mailto:support@seerkel.com" 
                    className="text-[#fbdf85] hover:text-[#fce9a8] underline transition-colors"
                  >
                    support@seerkel.com
                  </a>
                </p>
              </>
            }
          />

          <PolicySection
            title="Retención de datos"
            content={
              <p className="mb-4 leading-relaxed">
                Conservamos sus datos personales únicamente el tiempo necesario para cumplir con los 
                fines para los que fueron recopilados, lo que incluye proporcionarle acceso 
                ininterrumpido a nuestra plataforma, mantener su cuenta y respaldar las operaciones 
                comerciales y legales esenciales. Si decide cerrar su cuenta o retirar su 
                consentimiento para que procesemos sus datos, iniciaremos la eliminación de su 
                información personal en un plazo razonable, generalmente de acuerdo con nuestro 
                calendario de retención interno.
              </p>
            }
          />

          <PolicySection
            title="Actualizaciones de esta Política de Privacidad"
            content={
              <p className="mb-4 leading-relaxed">
                Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios 
                en nuestras prácticas, servicios u obligaciones legales. Notificaremos a los usuarios 
                sobre cambios significativos por correo electrónico o mediante avisos destacados en 
                nuestra plataforma. Le recomendamos revisar esta política periódicamente para 
                mantenerse informado sobre cómo protegemos sus datos.
              </p>
            }
          />

          <PolicySection
            title="Contacta con nosotros"
            content={
              <p className="mb-4 leading-relaxed">
                Si tiene alguna pregunta o inquietud sobre esta Política de Privacidad, nuestras 
                prácticas de datos o desea ejercer sus derechos de privacidad, contáctanos en{' '}
                <a 
                  href="mailto:support@seerkel.com" 
                  className="text-[#fbdf85] hover:text-[#fce9a8] underline transition-colors"
                >
                  support@seerkel.com
                </a>
              </p>
            }
          />
        </div>
      </div>
    </div>
  );
}

function PolicySection({ 
  title, 
  content 
}: { 
  title: string; 
  content: React.ReactNode;
}) {
  return (
    <section className="border-l-4 border-[#fbdf85] pl-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#fbdf85]">
        {title}
      </h2>
      <div className="text-gray-200">
        {content}
      </div>
    </section>
  );
}