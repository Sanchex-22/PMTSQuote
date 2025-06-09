"use client"

import type React from "react"
import { useState, useRef, useMemo } from "react"
import { submitRegistration } from "../../../actions/actions"
import { Courses } from "../../../data/courses"
import { courses } from "../../../data/courses"
import Images from "../../../assets"
import countryNationality from "../../../data/countries"

interface RegistrationResult {
  courses: Courses[]
  studentInfo: {
    name: string
    lastName: string
    document: string
    nationality: string
    email: string
    phone: string
  }
}

 const countryOptions = countryNationality.map(([country, ]) => ({
    label: country, // El nombre del país es lo que se muestra
    value: country  // El valor que se guarda es el nombre del país
    // Si quisieras guardar la nacionalidad en vez del país: value: nationality
  }));

// Componente Input personalizado
const CustomInput: React.FC<{
  id: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  required?: boolean
  icon?: React.ReactNode
}> = ({ id, type = "text", value, onChange, placeholder, required = false, icon }) => {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">{icon}</div>}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full h-12 px-4 ${icon ? "pl-10" : ""} bg-white border border-gray-200 rounded-xl 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all duration-200 text-gray-900 placeholder-gray-400
                   hover:border-gray-300`}
      />
    </div>
  )
}

// Componente Checkbox personalizado
const CustomCheckbox: React.FC<{
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: React.ReactNode
  required?: boolean
}> = ({ id, checked, onChange, label, required = false }) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          className="w-5 h-5 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 cursor-pointer"
        />
      </div>
      <label htmlFor={id} className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
        {label}
      </label>
    </div>
  )
}

// Componente Select personalizado
const CustomSelect: React.FC<{
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: Array<{ value: string; label: string; subtitle?: string }>
  icon?: React.ReactNode
}> = ({ value, onChange, placeholder, options, icon }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">{icon}</div>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 px-4 ${icon ? "pl-10" : ""} pr-10 bg-white border border-gray-200 rounded-xl 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all duration-200 text-left hover:border-gray-300
                   ${selectedOption ? "text-gray-900" : "text-gray-400"}`}
      >
        {selectedOption ? selectedOption.label : placeholder}
      </button>

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="text-gray-900">{option.label}</div>
              {option.subtitle && <div className="text-sm text-gray-500 mt-1">{option.subtitle}</div>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Componente para selección múltiple de cursos con búsqueda
const CourseSelector: React.FC<{
  selectedCourses: string[]
  onChange: (courses: string[]) => void
}> = ({ selectedCourses, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar cursos basado en el término de búsqueda
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses

    const term = searchTerm.toLowerCase()
    return courses.filter((course) => {
      return (
        course.name.toLowerCase().includes(term) ||
        course.abbr.toLowerCase().includes(term) ||
        (course.abbr && course.abbr.toLowerCase().includes(term))
      )
    })
  }, [searchTerm])

  const toggleCourse = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      onChange(selectedCourses.filter((id) => id !== courseId))
    } else {
      onChange([...selectedCourses, courseId])
    }
  }

  const selectedCoursesData = courses.filter((course) => selectedCourses.includes(String(course.id)))

  const clearSearch = () => {
    setSearchTerm("")
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-12 px-4 pl-10 pr-10 bg-white border border-gray-200 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200 text-left hover:border-gray-300 text-gray-900"
        >
          {selectedCourses.length === 0
            ? "Selecciona uno o más cursos"
            : `${selectedCourses.length} curso${selectedCourses.length > 1 ? "s" : ""} seleccionado${
                selectedCourses.length > 1 ? "s" : ""
              }`}
        </button>

        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <GraduationIcon />
        </div>

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-80 overflow-hidden">
            {/* Campo de búsqueda */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, abreviación o IMO..."
                  className="w-full h-10 px-4 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-sm"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </div>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <ClearIcon />
                  </button>
                )}
              </div>
            </div>

            {/* Lista de cursos filtrados */}
            <div className="max-h-60 overflow-y-auto">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <label
                    key={course.id}
                    className="flex items-start px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(String(course.id))}
                      onChange={() => toggleCourse(String(course.id))}
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 mr-3 mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-medium text-sm leading-tight">{course.name}</div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{course.abbr}</span>
                        {course.abbr && (
                          <span className="font-mono bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            IMO: {course.abbr}
                          </span>
                        )}
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <SearchIcon />
                  <p className="mt-2 text-sm">No se encontraron cursos</p>
                  <p className="text-xs text-gray-400">Intenta con otros términos de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Courses Preview */}
      {selectedCoursesData.length > 0 && (
        <div className="space-y-3">
          {selectedCoursesData.map((course) => (
            <div
              key={course.id}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-blue-900 text-sm leading-tight">{course.name}</h4>
                <div className="flex items-center gap-3 text-blue-700 text-xs mt-2">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded">{course.abbr}</span>
                  {course.abbr && <span className="font-mono bg-white px-2 py-1 rounded">ABBR: {course.abbr}</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleCourse(String(course.id))}
                className="text-red-500 hover:text-red-700 p-1 ml-3 flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Componente Button personalizado
const CustomButton: React.FC<{
  type?: "button" | "submit"
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary"
  children: React.ReactNode
  className?: string
}> = ({ type = "button", onClick, disabled = false, variant = "primary", children, className = "" }) => {
  const baseClasses =
    "w-full h-12 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"

  const variantClasses = {
    primary: `bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 
              disabled:bg-gray-300 disabled:cursor-not-allowed`,
    secondary: `bg-gray-900 text-white hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 
                disabled:bg-gray-300 disabled:cursor-not-allowed`,
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// Componente Captcha personalizado
const CustomCaptcha: React.FC<{
  verified: boolean
  onVerify: (verified: boolean) => void
}> = ({ verified, onVerify }) => {
  const [captchaCode, setCaptchaCode] = useState("")
  const [userInput, setUserInput] = useState("")
  const [error, setError] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generar un código CAPTCHA aleatorio
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789"
    let code = ""
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCaptchaCode(code)
    drawCaptcha(code)
    setUserInput("")
    setError(false)
    onVerify(false)
  }

  // Dibujar el CAPTCHA en el canvas
  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Limpiar el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fondo
    ctx.fillStyle = "#f3f4f6"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Dibujar líneas aleatorias
    ctx.strokeStyle = "#94a3b8"
    ctx.lineWidth = 1
    for (let i = 0; i < 10; i++) {
      ctx.beginPath()
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
      ctx.stroke()
    }

    // Dibujar puntos aleatorios
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = "#94a3b8"
      ctx.beginPath()
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2)
      ctx.fill()
    }

    // Configurar el texto
    ctx.font = "bold 24px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Dibujar cada carácter con rotación y posición aleatoria
    for (let i = 0; i < code.length; i++) {
      ctx.save()
      ctx.translate(20 + i * 25, canvas.height / 2)
      ctx.rotate((Math.random() - 0.5) * 0.4)
      ctx.fillStyle = `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(
        Math.random() * 100,
      )})`
      ctx.fillText(code[i], 0, 0)
      ctx.restore()
    }
  }

  // Verificar el CAPTCHA
  const verifyCaptcha = () => {
    if (userInput.toLowerCase() === captchaCode.toLowerCase()) {
      onVerify(true)
      setError(false)
    } else {
      setError(true)
      onVerify(false)
      generateCaptcha()
    }
  }

  // Generar CAPTCHA al cargar el componente
  useState(() => {
    generateCaptcha()
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <canvas
          ref={canvasRef}
          width={180}
          height={60}
          className="border border-gray-200 rounded-l-xl bg-gray-50"
        ></canvas>
        <button
          type="button"
          onClick={generateCaptcha}
          className="h-[60px] px-4 bg-gray-100 border border-l-0 border-gray-200 rounded-r-xl hover:bg-gray-200 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ingresa el código"
          className="flex-1 h-12 px-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="button"
          onClick={verifyCaptcha}
          className="h-12 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
        >
          Verificar
        </button>
      </div>

      {error && <p className="text-sm text-red-500">Código incorrecto. Intenta de nuevo.</p>}
      {verified && <p className="text-sm text-green-500">¡Verificación exitosa!</p>}
    </div>
  )
}

// Iconos SVG personalizados
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 919-9"
    />
  </svg>
)

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
)

const GraduationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
    />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
)

const ClearIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const LoadingSpinner = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    ></path>
  </svg>
)

export default function CourseQuote() {
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    document: "",
    nationality: "",
    email: "",
    phone: "",
    courses: [] as string[],
  })
  const [registration, setRegistration] = useState<RegistrationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.courses.length === 0) {
      alert("Por favor, selecciona al menos un curso.")
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
      // Ensure each course has the imo_no property
      const fixedResult: RegistrationResult = {
        ...result,
        courses: result.courses.map((course) => ({
          ...course,
          abbr: course?.abbr ?? null,
        })),
      }
      setRegistration(fixedResult)
      setShowConfirmation(true)
    } catch (error) {
      console.error("Error submitting registration:", error)
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
    doc.text("Registro de Cursos Marítimos", 20, 30)

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

    // Courses info
    doc.setFontSize(16)
    doc.text("Cursos Seleccionados", 20, 125)

    let yPosition = 140
    registration.courses.forEach((course, index) => {
      doc.setFontSize(12)
      doc.text(`${index + 1}. ${course.name}`, 20, yPosition)
      if (course.abbr) {
        doc.text(`   IMO: ${course.abbr}`, 20, yPosition + 10)
        yPosition += 35
      } else {
        yPosition += 25
      }
    })

    // Footer
    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(`Registro generado el: ${new Date().toLocaleDateString()}`, 20, yPosition + 20)

    doc.save(`registro-maritimo-${registration.studentInfo.name}-${registration.studentInfo.lastName}.pdf`)
  }

  // const countryOptions = countries.map((country) => ({
  //   value: country,
  //   label: country,
  // }))

  // Icono de flecha hacia atrás
  const BackIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )

  // Icono de check para éxito
  const CheckIcon = () => (
    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {!showConfirmation ? (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                <img src={Images.logo} alt="logo" width={70} height={70}/>
              </div>
              <h1 className="text-4xl font-light text-gray-900 mb-3">Consulta de Cursos</h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Completa tus datos y selecciona los cursos marítimos de tu interés
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-light text-gray-900 mb-2">Información Personal</h2>
                  <p className="text-gray-600">Ingresa tus datos para completar el registro</p>
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
                        Nacionalidad
                      </label>
                      <CustomSelect
                        value={formData.nationality}
                        onChange={(value) => handleInputChange("nationality", value)}
                        placeholder="Selecciona tu país"
                        options={countryOptions}
                        icon={<GlobeIcon />}
                      />
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
                        required
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

                  {/* Course Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cursos Marítimos de Interés
                      <span className="text-gray-500 font-normal ml-1">
                        (Busca por nombre, abreviación o número IMO)
                      </span>
                    </label>
                    <CourseSelector
                      selectedCourses={formData.courses}
                      onChange={(courses) => handleInputChange("courses", courses)}
                    />
                  </div>

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
                      disabled={isLoading || !captchaVerified || !termsAccepted || formData.courses.length === 0}
                      variant="primary"
                    >
                      {isLoading ? (
                        <>
                          <LoadingSpinner />
                          Procesando registro...
                        </>
                      ) : (
                        "Completar Registro"
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
              <h1 className="text-4xl font-light text-gray-900 mb-3">¡Registro Completado!</h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Tu registro para {registration?.courses.length} curso{registration?.courses.length !== 1 ? "s" : ""}{" "}
                marítimo{registration?.courses.length !== 1 ? "s" : ""} ha sido completado exitosamente
              </p>
            </div>

            {/* Confirmation Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-light text-green-700 mb-2">Registro Confirmado</h2>
                  <p className="text-gray-600">Resumen de tu registro de cursos marítimos</p>
                </div>

                {registration && (
                  <>
                    {/* Selected Courses */}
                    <div className="space-y-4 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cursos Seleccionados:</h3>
                      {registration.courses.map((course, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100"
                        >
                          <h4 className="text-lg font-semibold text-blue-900 mb-2">{course.name}</h4>
                          <div className="flex items-center gap-4 text-blue-700 text-sm">
                            {course.abbr && (
                              <span className="font-mono bg-white px-3 py-1 rounded-lg border">
                                IMO: {course.abbr}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
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
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <CustomButton onClick={handleBack} variant="primary" className="bg-gray-600 hover:bg-gray-700">
                        <BackIcon />
                        Nuevo Registro
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
