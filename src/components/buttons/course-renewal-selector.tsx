"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Courses, courses } from "../../data/courses"

// Componente para selección múltiple de cursos de renovación
const CourseRenewalSelector: React.FC<{
  selectedCourses: string[]
  onChange: (courses: string[]) => void
  government: string
}> = ({ selectedCourses, onChange, government }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Filtrar solo cursos que tienen precio de renovación
  const renewableCourses = useMemo(() => {
    return courses.filter((course) => {
      const hasRenewalPrice =
        government === "panama" ? course.price_panamanian_renewal !== null : course.price_foreign_renewal !== null

      if (!hasRenewalPrice) return false

      if (!searchTerm.trim()) return true

      const term = searchTerm.toLowerCase()
      return course.name.toLowerCase().includes(term) || course.abbr.toLowerCase().includes(term)
    })
  }, [searchTerm, government])

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

  // Calcular precio de renovación basado en el gobierno seleccionado
  const getRenewalPrice = (course: Courses) => {
    if (government === "panama") {
      return course.price_panamanian_renewal || 0
    } else {
      return course.price_foreign_renewal || 0
    }
  }

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
    <div className="space-y-3">
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-12 px-4 pl-10 pr-10 bg-white border border-gray-200 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                     transition-all duration-200 text-left hover:border-gray-300 text-gray-900"
        >
          {selectedCourses.length === 0
            ? "Selecciona cursos para renovar"
            : `${selectedCourses.length} renovación${selectedCourses.length > 1 ? "es" : ""} seleccionada${
                selectedCourses.length > 1 ? "s" : ""
              }`}
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
                  placeholder="Buscar cursos para renovar..."
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
                  const price = getRenewalPrice(course)
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
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{course.abbr}</span>
                          {price > 0 && (
                            <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                              ${price} (Renovación)
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  )
                })
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  <SearchIcon />
                  <p className="mt-2 text-sm">No se encontraron cursos renovables</p>
                  <p className="text-xs text-gray-400">Intenta con otros términos de búsqueda</p>
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
            const price = getRenewalPrice(course)
            return (
              <div
                key={course.id}
                className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-orange-900 text-sm leading-tight">
                    {course.name} <span className="text-xs text-orange-600">(Renovación)</span>
                  </h4>
                  <div className="flex items-center gap-3 text-orange-700 text-xs mt-2">
                    <span className="font-mono bg-orange-100 px-2 py-1 rounded">{course.abbr}</span>
                    {price > 0 && (
                      <span className="font-semibold text-orange-600 bg-white px-2 py-1 rounded">${price}</span>
                    )}
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
