"use client"

import type React from "react"
import { useState, useMemo, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next" // Importa useTranslation
import { Course } from "../../services/courses"


const CourseRenewalSelector: React.FC<{
  selectedCourses: string[]
  onChange: (courses: string[]) => void
  government: string
  availableCourses: Course[] // Esta es la prop crucial que recibirás
}> = ({ selectedCourses, onChange, government, availableCourses }) => { // Asegúrate de desestructurar availableCourses
  const { t } = useTranslation() // Inicializa el hook de traducción
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Calcular precio de renovación basado en el gobierno seleccionado
  const getRenewalPrice = (course: Course): number => { // Tipado de course como Course
    if (government === "panama") {
      return course.price_panamanian_renewal ?? 0 // Usar nullish coalescing para seguridad
    } else {
      return course.price_foreign_renewal ?? 0 // Usar nullish coalescing para seguridad
    }
  }
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
  // Filtrar solo cursos que tienen precio de renovación
  const renewableCourses = useMemo(() => {
    return availableCourses.filter((course) => { // <--- CAMBIO: Usar availableCourses
      const hasRenewalPrice = getRenewalPrice(course) > 0; // Utiliza la función para determinar si tiene precio de renovación válido

      if (!hasRenewalPrice) return false;

      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      return (
        (course.name && course.name.toLowerCase().includes(term)) ||
        (course.abbr && course.abbr.toLowerCase().includes(term)) ||
        (course.imo_no && String(course.imo_no).toLowerCase().includes(term))
      );
    });
  }, [searchTerm, government, availableCourses]);

  const toggleCourse = (courseId: string) => {
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

  // Iconos (sin cambios, solo los incluyo por completitud)
  const SearchIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  const RefreshIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )

  return (
    <div className="space-y-3" ref={selectRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-12 px-4 pl-10 pr-10 bg-white border border-gray-200 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                     transition-all duration-200 text-left hover:border-gray-300 text-gray-900"
        >
          {selectedCourses.length === 0
            ? t("Select courses for renewal") // <--- CAMBIO: Usar t()
            : t("{{count}} renewal(s) selected", { count: selectedCourses.length }) // <--- CAMBIO: Usar t() con pluralización
          }
        </button>

        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <RefreshIcon />
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
                  placeholder={t("Search renewal courses...")} // <--- CAMBIO: Usar t()
                  className="w-full h-10 px-4 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
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

            {/* Lista de cursos renovables filtrados */}
            <div className="max-h-60 overflow-y-auto">
              {renewableCourses.length > 0 ? (
                renewableCourses.map((course) => {
                  return (
                    <label
                      key={course.id}
                      className="flex items-start px-4 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(String(course.id))}
                        onChange={() => toggleCourse(String(course.id))}
                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-orange-300 mr-3 mt-1 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-900 font-medium text-sm leading-tight">{course.name}</div>
                        <div className="flex items-center justify-between gap-3 text-xs text-gray-500 mt-1">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{course.abbr || t("N/A")}</span> {/* <--- CAMBIO: Usar t() */}
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{course.imo_no || t("N/A")}</span>
                        </div>
                      </div>
                    </label>
                  )
                })
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <SearchIcon className="mx-auto w-6 h-6 text-gray-400" /> {/* Asegurar que los íconos se muestran centrado */}
                  <p className="mt-2 text-sm">{t("No renewable courses found")}</p> {/* <--- CAMBIO: Usar t() */}
                  <p className="text-xs text-gray-400">{t("Try other search terms")}</p> {/* <--- CAMBIO: Usar t() */}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Renewal Courses Preview */}
      {selectedCoursesData.length > 0 && (
        <div className="space-y-3">
          {selectedCoursesData.map((course) => {
            return (
              <div
                key={course.id}
                className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-orange-900 text-sm leading-tight">
                    {course.name} <span className="text-xs text-orange-600">({t("Renewal")})</span> {/* <--- CAMBIO: Usar t() */}
                  </h4>
                  <div className="flex items-center gap-3 text-orange-700 text-xs mt-2">
                    <span className="font-mono bg-orange-100 px-2 py-1 rounded">{course.abbr || t("N/A")}</span> {/* <--- CAMBIO: Usar t() */}
                    <span className="font-mono bg-orange-100 px-2 py-1 rounded">{course.imo_no || t("N/A")}</span> {/* <--- CAMBIO: Usar t() */}
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

export default CourseRenewalSelector