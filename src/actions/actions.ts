"use server"

import { Courses } from "../data/courses"
const { VITE_API_URL } = import.meta.env
interface FormData {
  name: string
  lastName: string
  document: string
  nationality: string
  email: string
  phone: string
  courses: string[]
  renewalCourses: string[]
  government: string
}

interface RegistrationResult {
  courses: Courses[]
  renewalCourses: Courses[]
  studentInfo: {
    name: string
    lastName: string
    document: string
    nationality: string
    email: string
    phone: string
  }
  totalCost: number
  newCoursesTotal: number
  renewalCoursesTotal: number
  government: string
}

export async function submitRegistration(formData: FormData): Promise<RegistrationResult> {
  // Simular procesamiento del backend
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Validar que se haya seleccionado una nacionalidad
  if (!formData.nationality) {
    throw new Error("Debe seleccionar una nacionalidad")
  }

  if (formData.courses.length === 0 && formData.renewalCourses.length === 0) {
    throw new Error("No se encontraron cursos seleccionados")
  }

  try {
    const response = await fetch(VITE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        submissionType: "quote",
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      let error
      try {
        error = JSON.parse(text)
      } catch {
        throw new Error("Respuesta inesperada del servidor")
      }
      throw new Error(error.message || "Hubo un error al enviar tu cotización")
    }

    const result = await response.json()

    // El backend ahora devuelve todos los cálculos
    return result
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Hubo un error al enviar tu cotización")
  }
}
