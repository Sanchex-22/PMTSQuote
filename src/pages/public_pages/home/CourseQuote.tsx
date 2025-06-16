"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useTranslation, Trans } from "react-i18next"
import { submitRegistration } from "../../../actions/actions"
import Images from "../../../assets"
import countryNationality from "../../../data/countries"

// Importar la clase de servicio y la interfaz de Course
// Asegúrate de que esta ruta sea correcta según la ubicación de tu archivo courses.ts o courseServices.ts
import { Course, CourseServices } from "../../../services/courses" // <--- REVISAR: Asegúrate que esta ruta sea la correcta (services/courses o services/courseServices)

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
} from "../../../components/icons/icons"

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
  courses: Course[]
  renewalCourses: Course[]
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
  const { t } = useTranslation()

  // NUEVOS ESTADOS PARA LOS CURSOS DE LA API
  const [apiCourses, setApiCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [errorCourses, setErrorCourses] = useState<string | null>(null)

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

  // EFECTO PARA CARGAR LOS CURSOS DE LA API AL MONTAR EL COMPONENTE
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true)
        setErrorCourses(null)
        const service = new CourseServices()
        const data = await service.getAllCourses()
        setApiCourses(data)
      } catch (err: unknown) { // Mejor tipado para el error
        console.error("Error al cargar cursos:", err)
        setErrorCourses(t("Failed to load courses. Please try again later.") + (err instanceof Error ? ` ${err.message}` : ''));
      } finally {
        setLoadingCourses(false)
      }
    }

    fetchCourses()
  }, []) // El array vacío asegura que se ejecute solo una vez al montar

  // Obtener información del gobierno
  const govInfo = getGovernmentInfo(formData.government)

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
        ...(field === "government" && { courses: [], renewalCourses: [] }),
      }
      if (field === "courses" && Array.isArray(value)) {
        const conflictingRenewals = prev.renewalCourses.filter((renewalId) => !value.includes(renewalId))
        newData.renewalCourses = conflictingRenewals
      }
      if (field === "renewalCourses" && Array.isArray(value)) {
        const conflictingNew = prev.courses.filter((courseId) => !value.includes(courseId))
        newData.courses = conflictingNew
      }
      return newData
    })
  }

  // --- REINTRODUCIDA Y MEJORADA ---
  const calculateCosts = () => {
    // AHORA USA apiCourses para encontrar los objetos completos
    const selectedNewCoursesData = apiCourses.filter((course) => formData.courses.includes(String(course.id)));
    const selectedRenewalCoursesData = apiCourses.filter((course) => formData.renewalCourses.includes(String(course.id)));

    const newCoursesTotal = selectedNewCoursesData.reduce(
      (total, course) => total + calculateCoursePrice(course, formData.nationality, formData.government),
      0,
    );
    const renewalCoursesTotal = selectedRenewalCoursesData.reduce(
      (total, course) => total + calculateRenewalPrice(course, formData.nationality, formData.government),
      0,
    );
    const totalCost = newCoursesTotal + renewalCoursesTotal;

    return {
      selectedNewCoursesData,
      selectedRenewalCoursesData,
      newCoursesTotal,
      renewalCoursesTotal,
      totalCost,
    };
  };
  // --- FIN REINTRODUCIDA Y MEJORADA ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (apiCourses.length === 0) {
      alert(t("Courses data is not loaded yet. Please wait or refresh."))
      return;
    }

    if (!formData.government) {
      alert(t("Please select a government/institution."))
      return
    }
    if (!formData.nationality) {
      alert(t("Please select your nationality."))
      return
    }
    if (formData.courses.length === 0 && formData.renewalCourses.length === 0) {
      alert(t("Please select at least one new or renewal course."))
      return
    }
    const conflicts = formData.courses.filter((courseId) => formData.renewalCourses.includes(courseId))
    if (conflicts.length > 0) {
      alert(t("Error: There are courses selected as both new and for renewal. Please review your selection."))
      return
    }
    if (!captchaVerified) {
      alert(t("Please verify the captcha before continuing."))
      return
    }
    if (!termsAccepted) {
      alert(t("You must accept the terms and conditions to continue."))
      return
    }

    setIsLoading(true)
    try {
      // Si submitRegistration necesita el formData completo y no devuelve los detalles del curso,
      // la siguiente lógica es correcta. Si submitRegistration DEVOLVIERA los datos de RegistrationResult,
      // entonces esta parte de la lógica cambiaría para usar lo que submitRegistration devuelve.
      // Para este ejemplo, asumo que submitRegistration solo procesa el formulario.
      await submitRegistration(formData); // Ejecuta la acción de envío del formulario si es necesario

      const {
        selectedNewCoursesData,
        selectedRenewalCoursesData,
        newCoursesTotal,
        renewalCoursesTotal,
        totalCost,
      } = calculateCosts(); // <-- USA LA FUNCIÓN REINTRODUCIDA

      // Find selected government label
      const selectedGov = governments.find((g) => g.value === formData.government)

      // Compose registration result
      const fixedResult: RegistrationResult = {
        courses: selectedNewCoursesData, // Ya son Course[]
        renewalCourses: selectedRenewalCoursesData, // Ya son Course[]
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
        government: selectedGov?.label || formData.government,
      }
      setRegistration(fixedResult)
      setShowConfirmation(true)
    } catch (error) {
      console.error("Error submitting registration:", error)
      alert(error instanceof Error ? error.message : t("There was an error submitting your quote"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setShowConfirmation(false)
    setRegistration(null)
  }

  // MANEJO DE ESTADOS DE CARGA Y ERROR PARA LOS CURSOS
  if (loadingCourses) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <span className="flex items-center">
          <LoadingSpinner />
          <span className="ml-3 text-lg text-gray-700">{t("Loading courses...")}</span>
        </span>
      </div>
    )
  }

  if (errorCourses) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 text-center">
        <p className="text-red-600 text-lg mb-4">{errorCourses}</p>
        <CustomButton onClick={() => window.location.reload()} variant="primary">
          {t("Reload Page")}
        </CustomButton>
      </div>
    )
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
              <h1 className="text-4xl font-light text-gray-900 mb-3">{t("Course Quote")}</h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                {t("Fill out the form to generate your quote")}
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-light text-gray-900 mb-2">{t("Personal Information")}</h2>
                  <p className="text-gray-600">{t("Complete your details to generate the quote")}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Last Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("Name")}
                      </label>
                      <CustomInput
                        id="name"
                        value={formData.name}
                        onChange={(value) => handleInputChange("name", value)}
                        placeholder={t("Your name")}
                        required
                        icon={<UserIcon />}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("Last Name")}
                      </label>
                      <CustomInput
                        id="lastName"
                        value={formData.lastName}
                        onChange={(value) => handleInputChange("lastName", value)}
                        placeholder={t("Your last name")}
                        required
                      />
                    </div>
                  </div>

                  {/* Document and Nationality */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("ID or Passport")}
                      </label>
                      <CustomInput
                        id="document"
                        value={formData.document}
                        onChange={(value) => handleInputChange("document", value)}
                        placeholder={t("Document number")}
                        required
                        icon={<DocumentIcon />}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("Nationality")} <span className="text-red-500">*</span>
                      </label>
                      <CustomSelect
                        value={formData.nationality}
                        onChange={(value) => handleInputChange("nationality", value)}
                        placeholder={t("Select your nationality")}
                        options={countryOptions}
                        icon={<GlobeIcon />}
                      />
                      <p className="text-xs text-gray-500">
                        {t("Determines whether you use prices for Panamanians or foreigners")}
                        {formData.nationality && (
                          <span className="block mt-1 font-medium">
                            {isPanamanian(formData.nationality)
                              ? t("✅ Panamanian prices")
                              : t("🌍 Foreigner prices")}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Email and Phone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("Email")}
                      </label>
                      <CustomInput
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(value) => handleInputChange("email", value)}
                        placeholder={t("you@email.com")}
                        icon={<MailIcon />}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        {t("Phone")}
                      </label>
                      <CustomInput
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(value) => handleInputChange("phone", value)}
                        placeholder={t("+1 (123) 456-7890")}
                        required
                        icon={<PhoneIcon />}
                      />
                    </div>
                  </div>

                  {/* Government Selection */}
                  <div className="space-y-2">
                    <label htmlFor="government" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Government/Institution")} <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      value={formData.government}
                      onChange={(value) => handleInputChange("government", value)}
                      placeholder={t("Select the government/institution")}
                      options={governments}
                      icon={<GlobeIcon />}
                    />
                    <p className="text-xs text-gray-500">
                      {govInfo?.surcharge > 0
                        ? t("A surcharge of {{surcharge}}% will be applied to the base price", {
                            surcharge: govInfo.surcharge,
                          })
                        : t("No additional surcharge")}
                    </p>
                  </div>

                  {/* Course Selection */}
                  {formData.nationality && formData.government && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("New Maritime Courses")}
                          <span className="text-gray-500 font-normal ml-1">
                            {t("(Search by name or abbreviation)")}
                          </span>
                        </label>
                        <CourseSelector
                          selectedCourses={formData.courses}
                          onChange={(courses) => handleInputChange("courses", courses)}
                          government={formData.government}
                          nationality={formData.nationality}
                          renewalCourses={formData.renewalCourses}
                          availableCourses={apiCourses}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("Course Renewal")}
                          <span className="text-gray-500 font-normal ml-1">
                            {t("(Only courses that allow renewal)")}
                          </span>
                        </label>
                        <CourseRenewalSelector
                          selectedCourses={formData.renewalCourses}
                          onChange={(courses) => handleInputChange("renewalCourses", courses)}
                          government={formData.government}
                          availableCourses={apiCourses}
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
                        availableCourses={apiCourses}
                      />
                    )}

                  {/* CAPTCHA */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("CAPTCHA Verification")}
                    </label>
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
                        <Trans i18nKey="I accept the <1>terms and conditions</1> and the <2>privacy policy</2>">
                          I accept the{" "}
                          <a href="#" className="text-blue-600 hover:underline">
                            terms and conditions
                          </a>{" "}
                          and the{" "}
                          <a href="#" className="text-blue-600 hover:underline">
                            privacy policy
                          </a>
                        </Trans>
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
                        !formData.government ||
                        apiCourses.length === 0 // Deshabilita si los cursos no se han cargado
                      }
                      variant="primary"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner />
                          {t("Generating quote...")}
                        </>
                      ) : (
                        t("Generate Quote")
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
              <h1 className="text-4xl font-light text-gray-900 mb-3">{t("Quote Generated!")}</h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                {t("Your quote has been generated successfully")}
              </p>
            </div>

            {/* Confirmation Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-light text-green-700 mb-2">{t("Quote Confirmed")}</h2>
                  <p className="text-gray-600">{t("Summary of your maritime course quote")}</p>
                </div>

                {registration && (
                  <>
                    {/* Total Cost Highlight */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200 mb-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">{t("Total Cost")}</h3>
                        <div className="text-4xl font-bold text-green-800">${registration.totalCost}</div>
                      </div>
                    </div>

                    {/* Selected Courses */}
                    <div className="space-y-4 mb-6">
                      {registration.courses.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("New Courses:")}</h3>
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
                                      {t("Code: {{abbr}}", { abbr: course.abbr })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {registration.renewalCourses.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("Renewals:")}</h3>
                          <div className="space-y-3">
                            {registration.renewalCourses.map((course, index) => (
                              <div
                                key={index}
                                className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border border-orange-100"
                              >
                                <h4 className="text-lg font-semibold text-orange-900 mb-2">
                                  {course.name} <span className="text-sm text-orange-600">{t("(Renewal)")}</span>
                                </h4>
                                <div className="flex items-center gap-4 text-orange-700 text-sm">
                                  {course.abbr && (
                                    <span className="font-mono bg-white px-3 py-1 rounded-lg border">
                                      {t("Code: {{abbr}}", { abbr: course.abbr })}
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
                      <h4 className="font-semibold text-gray-900 mb-4">{t("Student Details:")}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium text-gray-900">{t("Full name:")}</span>
                          <p>
                            {registration.studentInfo.name} {registration.studentInfo.lastName}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{t("Document:")}</span>
                          <p>{registration.studentInfo.document}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{t("Nationality:")}</span>
                          <p>{registration.studentInfo.nationality}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{t("Email:")}</span>
                          <p>{registration.studentInfo.email}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{t("Phone:")}</span>
                          <p>{registration.studentInfo.phone}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{t("Government/Institution:")}</span>
                          <p>{registration.government}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CustomButton onClick={handleBack} variant="primary" className="bg-gray-600 hover:bg-gray-700">
                        <BackIcon />
                        {t("New Quote")}
                      </CustomButton>
                      {/*
                      <CustomButton onClick={downloadPDF} variant="secondary">
                        <DownloadIcon />
                        {t("Download PDF")}
                      </CustomButton>
                      */}
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