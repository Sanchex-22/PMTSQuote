"use client" // <--- Asegúrate de que esta línea esté al inicio del archivo

import type React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { GraduationIcon, SearchIcon, ClearIcon, LoadingSpinner } from "../../../../components/icons/icons" // <--- Importa LoadingSpinner
import { type Course } from "../../../../services/courses"

interface CourseSelectorProps {
  selectedCourses: string[]
  onChange: (courses: string[]) => void
  government: string // Propriedad no usada directamente en este componente, pero puede ser útil para CourseRenewalSelector
  nationality: string // Propriedad no usada directamente en este componente
  renewalCourses: string[]
  availableCourses: Course[]
  loading: boolean;
  error: string | null; 
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  selectedCourses,
  onChange,
  renewalCourses,
  availableCourses,
  loading, // Destructuring de la nueva prop
  error // Destructuring de la nueva prop
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredCourses = useMemo(() => {
    // Si está cargando o hay un error, no mostramos cursos filtrados, solo el mensaje
    if (loading || error) return [];

    if (!searchTerm.trim()) return availableCourses

    const term = searchTerm.toLowerCase()
    return availableCourses.filter((course) => {
      return (
        course.name.toLowerCase().includes(term) ||
        (course.imo_no && course.imo_no.toLowerCase().includes(term)) ||
        (course.abbr && course.abbr.toLowerCase().includes(term))
      )
    })
  }, [searchTerm, availableCourses, loading, error]) // <--- Dependencias actualizadas

  const toggleCourse = (courseId: string) => {
    // No permitir seleccionar cursos si está cargando o hay un error de carga
    if (loading || error) return;

    // Verificar si el curso ya está seleccionado para renovación
    if (renewalCourses.includes(courseId)) {
      alert(t("This course is already selected for renewal. You cannot select it as a new course."))
      return
    }

    if (selectedCourses.includes(courseId)) {
      onChange(selectedCourses.filter((id) => id !== courseId))
    } else {
      onChange([...selectedCourses, courseId])
    }
  }

  const selectedCoursesData = availableCourses.filter((course) => selectedCourses.includes(String(course.id)))

  const clearSearch = () => {
    setSearchTerm("")
  }

  return (
    <div className="space-y-3" ref={selectRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-12 px-4 pl-10 pr-10 bg-white border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200 text-left hover:border-gray-300 text-gray-900"
        >
          {selectedCourses.length === 0
            ? t("Select one or more courses")
            : t("{{count}} course(s) selected", { count: selectedCourses.length })
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
                  placeholder={t("Search by name or abbreviation...")}
                  className="w-full h-10 px-4 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           text-sm"
                  disabled={loading || !!error} // Deshabilitar búsqueda si está cargando o hay error
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </div>
                {searchTerm && !loading && !error && ( // Solo mostrar el botón de limpiar si no está cargando/error
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

            {/* Lista de cursos filtrados - Renderizado condicional para carga/error */}
            <div className="max-h-60 overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-6 h-full text-gray-700">
                  <LoadingSpinner/>
                  <span className="mt-3 text-lg font-medium">{t("Loading courses...")}</span>
                  <p className="text-sm text-gray-500 mt-1">{t("Please wait while we fetch the courses.")}</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center p-6 h-full text-red-600 text-center">
                  <svg className="w-6 h-6 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-semibold text-sm">{t("Error loading courses")}</p>
                </div>
              ) : filteredCourses.length > 0 ? (
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
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{course.abbr || t("N/A")}</span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{course.imo_no || t("N/A")}</span>
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
                    <span className="font-mono bg-blue-100 px-2 py-1 rounded">{course.abbr || t("N/A")}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleCourse(String(course.id))}
                  className="text-red-500 hover:text-red-700 p-1 ml-3 flex-shrink-0"
                  disabled={loading || !!error} // Deshabilitar botón de remover si está cargando o hay error
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