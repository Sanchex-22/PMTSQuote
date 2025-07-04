"use server";


// Reemplaza esto con la URL real de tu API, ojalá desde variables de entorno
const { VITE_API_URL } = import.meta.env

export async function evaluationAction(formData: FormData) {
  
  // 1. Extraer los datos del objeto FormData
  const courseName = formData.get("courseName");
  const instructorName = formData.get("instructorName");
  const personnelAttention = formData.get("personnelAttention");
  const certificateDelivery = formData.get("certificateDelivery");
  const websiteInformation = formData.get("websiteInformation");
  const facilities = formData.get("facilities");
  const scheduleAppropriate = formData.get("scheduleAppropriate");
  const studyMaterial = formData.get("studyMaterial");
  const trainingQuality = formData.get("trainingQuality");
  const provideFeedback = formData.get("provideFeedback");
  const demonstrateExamples = formData.get("demonstrateExamples");
  const encourageParticipation = formData.get("encourageParticipation");
  const communicateClearly = formData.get("communicateClearly");
  const demonstrateKnowledge = formData.get("demonstrateKnowledge");

  // 2. Validación básica en el servidor
  if (
    !courseName ||
    !instructorName ||
    !personnelAttention ||
    !certificateDelivery ||
    !websiteInformation ||
    !facilities ||
    !scheduleAppropriate ||
    !studyMaterial ||
    !trainingQuality ||
    !provideFeedback ||
    !demonstrateExamples ||
    !encourageParticipation ||
    !communicateClearly ||
    !demonstrateKnowledge
  ) {
    return { success: false, message: "Por favor, complete todos los campos requeridos y suba el documento." };
  }

  // 4. Realizar la petición a tu backend
  
  try {
    // ¡IMPORTANTE! Reemplaza '/license-quote' con el endpoint real de tu API
    const response = await fetch(`${VITE_API_URL}/api/evaluation/new`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
      throw new Error(errorData.message || "Hubo un problema al contactar al servidor.");
    }
    
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