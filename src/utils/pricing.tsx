import { Courses } from "../data/courses"


// Gobiernos/países disponibles para selección
export const governments = [
  { value: "panama", label: "Panamá", flag: "🇵🇦", surcharge: 5 },
  { value: "honduras", label: "Honduras", flag: "🇭🇳", surcharge: 20 },
]

// Función para obtener información del gobierno
export const getGovernmentInfo = (governmentValue: string) => {
  return governments.find((g) => g.value === governmentValue) || governments[2] // default to "other"
}

// Función para determinar si es panameño (más flexible)
export const isPanamanian = (nationality: string): boolean => {
  const normalizedNationality = nationality.toLowerCase().trim()
  return (
    normalizedNationality === "panamá" ||
    normalizedNationality === "panama" ||
    normalizedNationality === "panameño" ||
    normalizedNationality === "panameña"
  )
}

// Función para calcular precio con recargo EN DÓLARES
export const calculatePriceWithSurcharge = (basePrice: number, surchargeAmount: number): number => {
  return basePrice + surchargeAmount
}

// Función para obtener precio base de curso nuevo
export const getCourseBasePrice = (course: Courses, nationality: string): number => {
  if (isPanamanian(nationality)) {
    return course.price_panamanian || 0
  } else {
    return course.price_foreign || 0
  }
}

// Función para obtener precio base de renovación
export const getRenewalBasePrice = (course: Courses, nationality: string): number => {
  if (isPanamanian(nationality)) {
    return (course.price_panamanian_renewal || 0) / 2
  } else {
    return (course.price_foreign_renewal || 0) / 2
  }
}

// Función para calcular precio final de curso nuevo
export const calculateCoursePrice = (course: Courses, nationality: string, government: string): number => {
  const basePrice = getCourseBasePrice(course, nationality)
  const govInfo = getGovernmentInfo(government)
  return calculatePriceWithSurcharge(basePrice, govInfo.surcharge)
}

// Función para calcular precio final de renovación
export const calculateRenewalPrice = (course: Courses, nationality: string, government: string): number => {
  const basePrice = getRenewalBasePrice(course, nationality)
  const govInfo = getGovernmentInfo(government)
  return calculatePriceWithSurcharge(basePrice, govInfo.surcharge)
}
