"use server";

import { revalidatePath } from 'next/cache';

// Reemplaza esto con la URL real de tu API, ojalá desde variables de entorno
const API_URL = process.env.VITE_API_URL || 'http://tu-backend.com/api';

// La función de una Server Action que usa `useFormState` recibe dos argumentos:
// prevState: el estado anterior del formulario (lo usaremos para los mensajes de éxito/error).
// formData: el objeto FormData que viene directamente del <form>.
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

  // 4. Realizar la petición a tu backend
  try {
    // ¡IMPORTANTE! Reemplaza '/license-quote' con el endpoint real de tu API
    const response = await fetch(`${API_URL}/license/license-quote`, {
      method: "POST",
      body: apiFormData,
      // NO establezcas el 'Content-Type'. El navegador/fetch lo hará automáticamente
      // con el 'boundary' correcto cuando el body es un objeto FormData.
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
      throw new Error(errorData.message || "Hubo un problema al contactar al servidor.");
    }
    
    // Si tu API devuelve algo, puedes procesarlo aquí
    // const result = await response.json();

    // Revalidar la ruta si es necesario (útil si muestras una lista de solicitudes)
    revalidatePath('/ruta-del-formulario'); 
    
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