import React from 'react';

// Definimos el componente funcional con tipado de TypeScript (React.FC)
const PrivacyPolicy: React.FC = () => {
  return (
    // Contenedor principal con fondo blanco, padding, bordes redondeados y una sombra sutil.
    // max-w-2xl limita el ancho en pantallas grandes para mejor legibilidad y mx-auto lo centra.
    <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
      
      {/* Título de la política de privacidad */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Privacy Policy
      </h2>

      {/* Párrafo con el contenido de la política */}
      <p className="text-gray-600 leading-relaxed">
        At Panama Maritime Training Services, the information and documents provided by users 
        are used exclusively for internal purposes and for the processing of services or 
        course-related procedures. All data will be handled confidentially and recorded only 
        to meet the requirements of enrollment and certification processes. We do not share 
        this information with any third parties outside the organization.
      </p>

    </div>
  );
};

export default PrivacyPolicy;