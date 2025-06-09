"use server"

import { courses, type Courses } from "../data/courses"

interface FormData {
  name: string
  lastName: string
  document: string
  nationality: string
  email: string
  phone: string
  courses: string[]
  renewalCourses: string[] // Nuevo campo para renovaciones
  government: string // Nuevo campo para el gobierno/país
}

interface RegistrationResult {
  courses: Courses[]
  renewalCourses: Courses[] // Nuevo campo para cursos de renovación
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

// Función para calcular el precio basado en el gobierno
function calculateCoursePrice(course: Courses, government: string): number {
  if (government === "panama") {
    return course.price_panamanian || 0
  } else {
    return course.price_foreign || 0
  }
}

// Función para calcular el precio de renovación
function calculateRenewalPrice(course: Courses, government: string): number {
  if (government === "panama") {
    return course.price_panamanian_renewal || 0
  } else {
    return course.price_foreign_renewal || 0
  }
}

// Función para obtener el nombre del gobierno
function getGovernmentName(governmentCode: string): string {
  const governments: Record<string, string> = {
    panama: "Panamá",
    colombia: "Colombia",
    venezuela: "Venezuela",
    ecuador: "Ecuador",
    peru: "Perú",
    other: "Otro país",
  }

  return governments[governmentCode] || governmentCode
}

export async function submitRegistration(formData: FormData): Promise<RegistrationResult> {
  // Simular procesamiento del backend
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Validar que se haya seleccionado un gobierno
  if (!formData.government) {
    throw new Error("Debe seleccionar un gobierno/país")
  }

  // Filtrar cursos seleccionados
  const selectedCourses = courses.filter((c) => formData.courses.includes(String(c.id)))
  const selectedRenewalCourses = courses.filter((c) => formData.renewalCourses.includes(String(c.id)))

  if (selectedCourses.length === 0 && selectedRenewalCourses.length === 0) {
    throw new Error("No se encontraron cursos seleccionados")
  }

  // Calcular costos
  const newCoursesTotal = selectedCourses.reduce((total, course) => {
    return total + calculateCoursePrice(course, formData.government)
  }, 0)

  const renewalCoursesTotal = selectedRenewalCourses.reduce((total, course) => {
    return total + calculateRenewalPrice(course, formData.government)
  }, 0)

  const totalCost = newCoursesTotal + renewalCoursesTotal

  // Preparar datos para enviar al backend
  const emailData = {
    ...formData,
    government: getGovernmentName(formData.government),
    selectedCourses: selectedCourses.map((course) => ({
      id: course.id,
      name: course.name,
      abbr: course.abbr,
      price: calculateCoursePrice(course, formData.government),
      type: "new",
    })),
    selectedRenewalCourses: selectedRenewalCourses.map((course) => ({
      id: course.id,
      name: course.name,
      abbr: course.abbr,
      price: calculateRenewalPrice(course, formData.government),
      type: "renewal",
    })),
    totalCost,
    newCoursesTotal,
    renewalCoursesTotal,
    submissionType: "quote",
  }

  try {
    const response = await fetch("https://pmts-qback.vercel.app/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
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
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Hubo un error al enviar tu cotización")
  }

  // Devolver resultados
  return {
    courses: selectedCourses,
    renewalCourses: selectedRenewalCourses,
    studentInfo: {
      name: formData.name,
      lastName: formData.lastName,
      document: formData.document,
      nationality: formData.nationality,
      email: formData.email,
      phone: formData.phone,
    },
    totalCost,
    newCoursesTotal,
    renewalCoursesTotal,
    government: getGovernmentName(formData.government),
  }
}

// Función adicional para obtener solo la cotización sin enviar email (opcional)
export async function calculateQuote(formData: FormData): Promise<{
  courses: Array<{
    id: number
    name: string
    abbr: string
    price: number
  }>
  totalCost: number
  government: string
}> {
  // Validar que se haya seleccionado un gobierno
  if (!formData.government) {
    throw new Error("Debe seleccionar un gobierno/país")
  }

  // Filtrar cursos seleccionados
  const selectedCourses = courses.filter((c) => formData.courses.includes(String(c.id)))

  if (selectedCourses.length === 0) {
    throw new Error("No se encontraron cursos seleccionados")
  }

  // Calcular precios y total
  const coursesWithPrices = selectedCourses.map((course) => ({
    id: course.id,
    name: course.name,
    abbr: course.abbr,
    price: calculateCoursePrice(course, formData.government),
  }))

  const totalCost = coursesWithPrices.reduce((total, course) => total + course.price, 0)

  return {
    courses: coursesWithPrices,
    totalCost,
    government: getGovernmentName(formData.government),
  }
}
