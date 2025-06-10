"use client"

import type React from "react"
import { useState } from "react"
import { submitRegistration } from "../../../actions/actions"
import type { Courses } from "../../../data/courses"
import { courses } from "../../../data/courses"
import Images from "../../../assets"
import countryNationality from "../../../data/countries"

// Importar iconos
import {
  UserIcon,
  DocumentIcon,
  GlobeIcon,
  MailIcon,
  PhoneIcon,
  LoadingSpinner,
  BackIcon,
  CheckIcon,
  DownloadIcon,
} from "../../../components/icons/icons"

// Importar utilidades
import {
  governments,
  getGovernmentInfo,
  calculateCoursePrice,
  calculateRenewalPrice,
  isPanamanian,
} from "../../../utils/pricing"
import { CourseSelector } from "./components/course-selector"
import CourseRenewalSelector from "../../../components/buttons/course-renewal-selector"
import { QuoteSummary } from "./components/quote-summary"
import { CustomCaptcha } from "../../../components/forms/custom-captcha"
import { CustomCheckbox } from "../../../components/forms/custom-checkbox"
import { CustomButton } from "../../../components/forms/custom-button"
import { CustomInput } from "../../../components/forms/customInput"
import { CustomSelect } from "../../../components/forms/custom-select"

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

const countryOptions = countryNationality.map(([country]) => ({
  label: country,
  value: country,
}))

export default function CourseQuote() {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    document: "",
    nationality: "",
    email: "",
    phone: "",
    courses: [] as string[],
    renewalCourses: [] as string[],
    government: "",
  })
  const [registration, setRegistration] = useState<RegistrationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Obtener información del gobierno
  const govInfo = getGovernmentInfo(formData.government)

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
        // Limpiar cursos seleccionados cuando cambia el gobierno
        ...(field === "government" && { courses: [], renewalCourses: [] }),
      }

      // Si se está modificando cursos nuevos, remover conflictos de renovaciones
      if (field === "courses" && Array.isArray(value)) {
        const conflictingRenewals = prev.renewalCourses.filter((renewalId) => !value.includes(renewalId))
        newData.renewalCourses = conflictingRenewals
      }

      // Si se está modificando renovaciones, remover conflictos de cursos nuevos
      if (field === "renewalCourses" && Array.isArray(value)) {
        const conflictingNew = prev.courses.filter((courseId) => !value.includes(courseId))
        newData.courses = conflictingNew
      }

      return newData
    })
  }

  // Calcular el costo total
const calculateTotalCost = () => {
    const selectedCoursesData = courses.filter((course) => formData.courses.includes(String(course.id)))
    const selectedRenewalCoursesData = courses.filter((course) => formData.renewalCourses.includes(String(course.id)))

    const newCoursesTotal = selectedCoursesData.reduce((total, course) => {
      return total + calculateCoursePrice(course, formData.nationality, formData.government)
    }, 0)

    const renewalCoursesTotal = selectedRenewalCoursesData.reduce((total, course) => {
      return total + calculateRenewalPrice(course, formData.nationality, formData.government)
    }, 0)

    return newCoursesTotal + renewalCoursesTotal
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.government) {
      alert("Por favor, selecciona un gobierno/institución.")
      return
    }

    if (!formData.nationality) {
      alert("Por favor, selecciona tu nacionalidad.")
      return
    }

    if (formData.courses.length === 0 && formData.renewalCourses.length === 0) {
      alert("Por favor, selecciona al menos un curso nuevo o de renovación.")
      return
    }

    // Verificar que no hay conflictos (validación adicional)
    const conflicts = formData.courses.filter((courseId) => formData.renewalCourses.includes(courseId))

    if (conflicts.length > 0) {
      alert("Error: Hay cursos seleccionados tanto como nuevos como para renovación. Por favor, revisa tu selección.")
      return
    }

    if (!captchaVerified) {
      alert("Por favor, verifica el captcha antes de continuar.")
      return
    }

    if (!termsAccepted) {
      alert("Debes aceptar los términos y condiciones para continuar.")
      return
    }

    setIsLoading(true)

    try {
      const result = await submitRegistration(formData)
      const totalCost = calculateTotalCost()
      const selectedGov = governments.find((g) => g.value === formData.government)

      const selectedNewCoursesData = courses.filter((course) => formData.courses.includes(String(course.id)))
      const selectedRenewalCoursesData = courses.filter((course) => formData.renewalCourses.includes(String(course.id)))

      const newCoursesTotal = selectedNewCoursesData.reduce((total, course) => {
        return total + calculateCoursePrice(course, formData.nationality, formData.government)
      }, 0)

      const renewalCoursesTotal = selectedRenewalCoursesData.reduce((total, course) => {
        return total + calculateRenewalPrice(course, formData.nationality, formData.government)
      }, 0)

      const fixedResult: RegistrationResult = {
        ...result,
        courses: selectedNewCoursesData.map((course) => ({
          ...course,
          abbr: course?.abbr ?? null,
        })),
        renewalCourses: selectedRenewalCoursesData.map((course) => ({
          ...course,
          abbr: course?.abbr ?? null,
        })),
        totalCost,
        newCoursesTotal,
        renewalCoursesTotal,
        government: selectedGov?.label || formData.government,
      }
      setRegistration(fixedResult)
      setShowConfirmation(true)
    } catch (error) {
      console.error("Error submitting registration:", error)
      alert(error instanceof Error ? error.message : "Hubo un error al enviar tu cotización")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setShowConfirmation(false)
    setRegistration(null)
  }

  const downloadPDF = async () => {
    if (!registration) return

    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF()

    // Header
    doc.setFontSize(24)
    doc.setTextColor(59, 130, 246)
    doc.text("Cotización de Cursos Marítimos", 20, 30)

    // Student info
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text("Información del Estudiante", 20, 50)

    doc.setFontSize(12)
    doc.text(`Nombre: ${registration.studentInfo.name} ${registration.studentInfo.lastName}`, 20, 65)
    doc.text(`Documento: ${registration.studentInfo.document}`, 20, 75)
    doc.text(`Nacionalidad: ${registration.studentInfo.nationality}`, 20, 85)
    doc.text(`Email: ${registration.studentInfo.email}`, 20, 95)
    doc.text(`Teléfono: ${registration.studentInfo.phone}`, 20, 105)
    doc.text(`Gobierno/Institución: ${registration.government}`, 20, 115)

    // Courses info
    doc.setFontSize(16)
    doc.text("Cursos Seleccionados", 20, 125)

    let yPosition = 140
    registration.courses.forEach((course, index) => {
      doc.setFontSize(12)
      doc.text(`${index + 1}. ${course.name}`, 20, yPosition)
      if (course.abbr) {
        doc.text(`   Código: ${course.abbr}`, 20, yPosition + 10)
        yPosition += 35
      } else {
        yPosition += 25
      }
    })

    // Total cost
    doc.setFontSize(16)
    doc.setTextColor(0, 128, 0)
    doc.text(`Costo Total: $${registration.totalCost}`, 20, yPosition + 20)

    // Surcharge info
    if (govInfo?.surcharge > 0) {
      doc.setFontSize(10)
      doc.setTextColor(255, 140, 0)
      doc.text(`*Incluye ${govInfo?.surcharge}% de recargo por gobierno/institución`, 20, yPosition + 35)
    }

    // Footer
    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(`Cotización generada el: ${new Date().toLocaleDateString()}`, 20, yPosition + 50)

    doc.save(`cotizacion-maritima-${registration.studentInfo.name}-${registration.studentInfo.lastName}.pdf`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {!showConfirmation ? (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                <img src={Images.logo || "/placeholder.svg"} alt="logo" width={70} height={70} />
              </div>
              <h1 className="text-4xl font-light text-gray-900 mb-3">Cotización de Cursos</h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Selecciona tu nacionalidad, gobierno/institución y los cursos marítimos de tu interés para obtener una
                cotización
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-light text-gray-900 mb-2">Información Personal</h2>
                  <p className="text-gray-600">Completa tus datos para generar la cotización</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <CustomInput
                        id="name"
                        value={formData.name}
                        onChange={(value) => handleInputChange("name", value)}
                        placeholder="Tu nombre"
                        required
                        icon={<UserIcon />}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Apellido
                      </label>
                      <CustomInput
                        id="lastName"
                        value={formData.lastName}
                        onChange={(value) => handleInputChange("lastName", value)}
                        placeholder="Tu apellido"
                        required
                      />
                    </div>
                  </div>

                  {/* Document and Nationality */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
                        Cédula o Pasaporte
                      </label>
                      <CustomInput
                        id="document"
                        value={formData.document}
                        onChange={(value) => handleInputChange("document", value)}
                        placeholder="Número de documento"
                        required
                        icon={<DocumentIcon />}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
                        Nacionalidad <span className="text-red-500">*</span>
                      </label>
                      <CustomSelect
                        value={formData.nationality}
                        onChange={(value) => handleInputChange("nationality", value)}
                        placeholder="Selecciona tu nacionalidad"
                        options={countryOptions}
                        icon={<GlobeIcon />}
                      />
                      <p className="text-xs text-gray-500">
                        Determina si usas precios para panameños o extranjeros
                        {formData.nationality && (
                          <span className="block mt-1 font-medium">
                            {isPanamanian(formData.nationality) ? "✅ Precios panameños" : "🌍 Precios extranjeros"}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico
                      </label>
                      <CustomInput
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(value) => handleInputChange("email", value)}
                        placeholder="tu@email.com"
                        icon={<MailIcon />}
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <CustomInput
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(value) => handleInputChange("phone", value)}
                        placeholder="+1 (123) 456-7890"
                        required
                        icon={<PhoneIcon />}
                      />
                    </div>
                  </div>

                  {/* Government Selection */}
                  <div className="space-y-2">
                    <label htmlFor="government" className="block text-sm font-medium text-gray-700 mb-2">
                      Gobierno/Institución <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.government}
                      onChange={(value) => handleInputChange("government", value)}
                      placeholder="Selecciona el gobierno/institución"
                      options={governments}
                      icon={<GlobeIcon />}
                    />
                    <p className="text-xs text-gray-500">
                      {govInfo?.surcharge > 0
                        ? `Se aplicará un recargo del ${govInfo?.surcharge}% sobre el precio base`
                        : "Sin recargo adicional"}
                    </p>
                  </div>

                  {/* Course Selection - Only show if nationality and government are selected */}
                  {formData.nationality && formData.government && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cursos Marítimos Nuevos
                          <span className="text-gray-500 font-normal ml-1">(Busca por nombre o abreviación)</span>
                        </label>
                        <CourseSelector
                          selectedCourses={formData.courses}
                          onChange={(courses) => handleInputChange("courses", courses)}
                          government={formData.government}
                          nationality={formData.nationality}
                          renewalCourses={formData.renewalCourses}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Renovación de Cursos
                          <span className="text-gray-500 font-normal ml-1">(Solo cursos que permiten renovación)</span>
                        </label>
                        <CourseRenewalSelector
                          selectedCourses={formData.renewalCourses}
                          onChange={(courses) => handleInputChange("renewalCourses", courses)}
                          government={formData.government}
                        />
                      </div>
                    </>
                  )}

                  {/* Quote Summary */}
                  {formData.nationality &&
                    formData.government &&
                    (formData.courses.length > 0 || formData.renewalCourses.length > 0) && (
                      <QuoteSummary
                        selectedCourses={formData.courses}
                        selectedRenewalCourses={formData.renewalCourses}
                        government={formData.government}
                        nationality={formData.nationality}
                      />
                    )}

                  {/* CAPTCHA */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verificación CAPTCHA</label>
                    <CustomCaptcha verified={captchaVerified} onVerify={setCaptchaVerified} />
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-2">
                    <CustomCheckbox
                      id="terms"
                      checked={termsAccepted}
                      onChange={setTermsAccepted}
                      required
                      label={
                        <span>
                          Acepto los{" "}
                          <a href="#" className="text-blue-600 hover:underline">
                            términos y condiciones
                          </a>{" "}
                          y la{" "}
                          <a href="#" className="text-blue-600 hover:underline">
                            política de privacidad
                          </a>
                        </span>
                      }
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <CustomButton
                      type="submit"
                      disabled={
                        isLoading ||
                        !captchaVerified ||
                        !termsAccepted ||
                        (formData.courses.length === 0 && formData.renewalCourses.length === 0) ||
                        !formData.nationality ||
                        !formData.government
                      }
                      variant="primary"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner />
                          Generando cotización...
                        </>
                      ) : (
                        "Generar Cotización"
                      )}
                    </CustomButton>
                  </div>
                </form>
              </div>
            </div>
          </>
        ) : (
          /* Confirmation View */
          <>
            {/* Success Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-6 shadow-lg text-white">
                <CheckIcon />
              </div>
              <h1 className="text-4xl font-light text-gray-900 mb-3">¡Cotización Generada!</h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Tu cotización ha sido generada exitosamente
              </p>
            </div>

            {/* Confirmation Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-light text-green-700 mb-2">Cotización Confirmada</h2>
                  <p className="text-gray-600">Resumen de tu cotización de cursos marítimos</p>
                </div>

                {registration && (
                  <>
                    {/* Total Cost Highlight */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 mb-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">Costo Total</h3>
                        <div className="text-4xl font-bold text-green-800">${registration.totalCost}</div>
                        <div className="flex justify-center gap-4 mt-3 text-sm">
                          {registration.newCoursesTotal > 0 && (
                            <span className="text-green-600">Nuevos: ${registration.newCoursesTotal}</span>
                          )}
                          {registration.renewalCoursesTotal > 0 && (
                            <span className="text-orange-600">Renovaciones: ${registration.renewalCoursesTotal}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Selected Courses */}
                    <div className="space-y-4 mb-6">
                      {/* Cursos Nuevos */}
                      {registration.courses.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cursos Nuevos:</h3>
                          <div className="space-y-3">
                            {registration.courses.map((course, index) => (
                              <div
                                key={index}
                                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100"
                              >
                                <h4 className="text-lg font-semibold text-blue-900 mb-2">{course.name}</h4>
                                <div className="flex items-center gap-4 text-blue-700 text-sm">
                                  {course.abbr && (
                                    <span className="font-mono bg-white px-3 py-1 rounded-lg border">
                                      Código: {course.abbr}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Cursos de Renovación */}
                      {registration.renewalCourses.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">Renovaciones:</h3>
                          <div className="space-y-3">
                            {registration.renewalCourses.map((course, index) => (
                              <div
                                key={index}
                                className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100"
                              >
                                <h4 className="text-lg font-semibold text-orange-900 mb-2">
                                  {course.name} <span className="text-sm text-orange-600">(Renovación)</span>
                                </h4>
                                <div className="flex items-center gap-4 text-orange-700 text-sm">
                                  {course.abbr && (
                                    <span className="font-mono bg-white px-3 py-1 rounded-lg border">
                                      Código: {course.abbr}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Student Info */}
                    <div className="bg-gray-50 p-6 rounded-2xl mb-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Datos del estudiante:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium text-gray-900">Nombre completo:</span>
                          <p>
                            {registration.studentInfo.name} {registration.studentInfo.lastName}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Documento:</span>
                          <p>{registration.studentInfo.document}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Nacionalidad:</span>
                          <p>{registration.studentInfo.nationality}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Email:</span>
                          <p>{registration.studentInfo.email}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Teléfono:</span>
                          <p>{registration.studentInfo.phone}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Gobierno/Institución:</span>
                          <p>{registration.government}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CustomButton onClick={handleBack} variant="primary" className="bg-gray-600 hover:bg-gray-700">
                        <BackIcon />
                        Nueva Cotización
                      </CustomButton>

                      <CustomButton onClick={downloadPDF} variant="secondary">
                        <DownloadIcon />
                        Descargar PDF
                      </CustomButton>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
