"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useTranslation } from "react-i18next" // <--- Importa useTranslation
import { GraduationIcon, SearchIcon, ClearIcon } from "../../../../components/icons/icons"
import { getCourseBasePrice, calculateCoursePrice } from "../../../../utils/pricing"
// REMOVER: import { Courses, courses } from "../../../../data/courses" // <--- Elimina esta línea
import { type Course } from "../../../../services/courses" // <--- Importa la interfaz Course desde tu servicio

interface CourseSelectorProps {
  selectedCourses: string[]
  onChange: (courses: string[]) => void
  government: string
  nationality: string
  renewalCourses: string[]
  availableCourses: Course[] // <--- Esta es la prop crucial que recibirás
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  selectedCourses,
  onChange,
  government,
  nationality,
  renewalCourses,
  availableCourses, // <--- Asegúrate de desestructurar availableCourses
}) => {
  const { t } = useTranslation() // <--- Inicializa el hook de traducción
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar cursos basado en el término de búsqueda
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return availableCourses // <--- CAMBIO: Usar availableCourses

    const term = searchTerm.toLowerCase()
    return availableCourses.filter((course) => { // <--- CAMBIO: Usar availableCourses
      return (
        course.name.toLowerCase().includes(term) ||
        (course.abbr && course.abbr.toLowerCase().includes(term)) // <--- Asegura que abbr no sea null
      )
    })
  }, [searchTerm, availableCourses]) // <--- CAMBIO: availableCourses como dependencia

  const toggleCourse = (courseId: string) => {
    // Verificar si el curso ya está seleccionado para renovación
    if (renewalCourses.includes(courseId)) {
      alert(t("This course is already selected for renewal. You cannot select it as a new course.")) // <--- CAMBIO: Usar t()
      return
    }

    if (selectedCourses.includes(courseId)) {
      onChange(selectedCourses.filter((id) => id !== courseId))
    } else {
      onChange([...selectedCourses, courseId])
    }
  }

  // <--- CAMBIO: Usar availableCourses para obtener los datos completos de los cursos seleccionados
  const selectedCoursesData = availableCourses.filter((course) => selectedCourses.includes(String(course.id)))

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
            ? t("Select one or more courses") // <--- CAMBIO: Usar t()
            : t("{{count}} course(s) selected", { count: selectedCourses.length }) // <--- CAMBIO: Usar t() con pluralización
          }
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
                  placeholder={t("Search by name or abbreviation...")} // <--- CAMBIO: Usar t()
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
                filteredCourses.map((course) => {
                  const isInRenewal = renewalCourses.includes(String(course.id))
                  const isSelected = selectedCourses.includes(String(course.id))

                  return (
                    <label
                      key={course.id}
                      className={`flex items-start px-4 py-3 transition-colors duration-150 border-b border-gray-100 last:border-b-0 ${
                        isInRenewal ? "bg-gray-100 cursor-not-allowed opacity-60" : "hover:bg-gray-50 cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCourse(String(course.id))}
                        disabled={isInRenewal}
                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 mr-3 mt-1 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium text-sm leading-tight ${
                            isInRenewal ? "text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {course.name}
                          {isInRenewal && (
                            <span className="text-orange-600 ml-2">({t("Already selected for renewal")})</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs text-gray-500 mt-1">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{course.abbr || t("N/A")}</span> {/* <--- CAMBIO: Usar t() */}
                        </div>
                      </div>
                    </label>
                  )
                })
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <span className="mx-auto w-6 h-6 text-gray-400">
                    <SearchIcon />
                  </span>
                  <p className="mt-2 text-sm">{t("No courses found")}</p>
                  <p className="text-xs text-gray-400">{t("Try other search terms")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Courses Preview */}
      {selectedCoursesData.length > 0 && (
        <div className="space-y-3">
          {selectedCoursesData.map((course) => {
            return (
              <div
                key={course.id}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-blue-900 text-sm leading-tight">{course.name}</h4>
                  <div className="flex items-center gap-3 text-blue-700 text-xs mt-2">
                    <span className="font-mono bg-blue-100 px-2 py-1 rounded">{course.abbr || t("N/A")}</span> {/* <--- CAMBIO: Usar t() */}
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
            )
          })}
        </div>
      )}
    </div>
  )
}