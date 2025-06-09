"use server";

import { courses, Courses } from "../data/courses";

interface FormData {
  name: string;
  lastName: string;
  document: string;
  nationality: string;
  email: string;
  phone: string;
  courses: string[];
}

interface RegistrationResult {
  courses: Courses[];
  studentInfo: {
    name: string;
    lastName: string;
    document: string;
    nationality: string;
    email: string;
    phone: string;
  };
}

export async function submitRegistration(formData: FormData): Promise<RegistrationResult> {
  // Simular procesamiento del backend
  await new Promise((resolve) => setTimeout(resolve, 1500));

  try {
    const response = await fetch("https://pmts-qback.vercel.app/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const text = await response.text();
      let error;
      try {
        error = JSON.parse(text);
      } catch {
        throw new Error("Respuesta inesperada del servidor");
      }
      throw new Error(error.message || "Hubo un error al enviar tu confirmación");
    }
  } catch (error) {
    // Aquí simplemente relanzamos el error para que el consumidor lo maneje
    throw new Error(
      error instanceof Error ? error.message : "Hubo un error al enviar tu confirmación"
    );
  }

  // Filtrar cursos seleccionados
  const selectedCourses = courses.filter((c) => formData.courses.includes(String(c.id)));

  if (selectedCourses.length === 0) {
    throw new Error("No se encontraron cursos seleccionados");
  }

  // Devolver resultados
  return {
    courses: selectedCourses,
    studentInfo: {
      name: formData.name,
      lastName: formData.lastName,
      document: formData.document,
      nationality: formData.nationality,
      email: formData.email,
      phone: formData.phone,
    },
  };
}
