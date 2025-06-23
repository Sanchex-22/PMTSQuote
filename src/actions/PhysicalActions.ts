// app/actions.ts (o donde prefieras, por ejemplo, lib/actions.ts)
"use server"; // ¡Muy importante! Marca esto como una Server Action

const { VITE_API_URL } = import.meta.env

export async function submitMedicalCertificate(formData: FormData) {
  console.log("Server Action: submitMedicalCertificate recibiendo datos...");
  console.log("--- Inspeccionando FormData entries en la Server Action ---");
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`Campo Archivo: ${key}, Nombre: ${value.name}, Tamaño: ${value.size}, Tipo: ${value.type}`);
    } else {
      console.log(`Campo Texto: ${key}, Valor: ${value}`);
    }
  }
  console.log("--- Fin de la inspeccióan de FormData ---");

  if (!VITE_API_URL) {
    console.error("Error: VITE_API_URL no está configurada en las variables de entorno del servidor.");
    return { success: false, message: "Error de configuración del servidor. Contacte al administrador." };
  }

  try { // Movido el try para englobar la lógica de fetch
    const response = await fetch(`${VITE_API_URL}/api/physical/physical-quote`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `Error del servidor: ${response.status} ${response.statusText}` };
      }
      console.error("Error de la API externa:", errorData);
      return { success: false, message: errorData.message || "Hubo un problema al contactar al servidor externo." };
    }

    const responseData = await response.json(); // Asumiendo que la API devuelve JSON en éxito
    console.log("Respuesta exitosa de la API externa:", responseData);

    return { success: true, message: responseData.message || "¡Solicitud enviada con éxito! Nos pondremos en contacto pronto." , data: responseData };

  } catch (error: unknown) {
    console.error("Error en la Server Action al contactar la API externa:", error);
    let errorMessage = "No se pudo enviar la solicitud. Intente de nuevo.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, message: errorMessage };
  }
}