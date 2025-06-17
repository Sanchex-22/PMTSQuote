"use server";


// Reemplaza esto con la URL real de tu API, ojalá desde variables de entorno
const { VITE_API_URL } = import.meta.env

export async function submitLicenseApplication(formData: FormData) {
  
  // 1. Extraer los datos del objeto FormData
  const nombre = formData.get("nombre");
  const apellido = formData.get("apellido");
  const correo = formData.get("correo");
  const telefono = formData.get("telefono");
  const direccion = formData.get("direccion");
  const licencias = formData.get("licencias");
  const documento = formData.get("documento"); // Esto es un objeto File

  // 2. Validación básica en el servidor
  if (
    !nombre ||
    !apellido ||
    !correo ||
    !documento ||
    !(documento instanceof File) ||
    documento.size === 0
  ) {
    return { success: false, message: "Por favor, complete todos los campos requeridos y suba el documento." };
  }

  // 3. Preparar los datos para enviarlos a la API externa
  // Como tenemos un archivo, debemos reenviar los datos como FormData, no como JSON.
  const apiFormData = new FormData();
  apiFormData.append("nombre", nombre);
  apiFormData.append("apellido", apellido);
  apiFormData.append("correo", correo);
  apiFormData.append("telefono", telefono ? String(telefono) : "");
  apiFormData.append("direccion", direccion ? String(direccion) : "");
  apiFormData.append("licencias", licencias ? String(licencias) : "");
  apiFormData.append("documento", documento);
  for (const [key, value] of apiFormData.entries()) {
  console.log(`${key}:`, value);
}

  // 4. Realizar la petición a tu backend
  
  try {
    // ¡IMPORTANTE! Reemplaza '/license-quote' con el endpoint real de tu API
    const response = await fetch(`${VITE_API_URL}/api/license/license-quote`, {
      method: "POST",
      body: apiFormData,
      // NO establezcas el 'Content-Type'. El navegador/fetch lo hará automáticamente
      // con el 'boundary' correcto cuando el body es un objeto FormData.
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
      throw new Error(errorData.message || "Hubo un problema al contactar al servidor.");
    }
    // revalidatePath('/ruta-del-formulario'); 
    
    return { success: true, message: "¡Solicitud enviada con éxito! Nos pondremos en contacto pronto." };

  } catch (error) {
    console.error("Error en la Server Action:", error);
    let errorMessage = "No se pudo enviar la solicitud. Intente de nuevo.";
    if (error instanceof Error) {
      errorMessage = error.message || errorMessage;
    }
    return { success: false, message: errorMessage };
  }
}