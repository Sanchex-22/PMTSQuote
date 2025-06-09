"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { GraduationIcon, SearchIcon, ClearIcon } from "../../../../components/icons/icons"
import { getGovernmentInfo, getCourseBasePrice, calculateCoursePrice } from "../../../../utils/pricing"
import { courses } from "../../../../data/courses"

interface CourseSelectorProps {
  selectedCourses: string[]
  onChange: (courses: string[]) => void
  government: string
  nationality: string
  renewalCourses: string[]
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  selectedCourses,
  onChange,
  government,
  nationality,
  renewalCourses,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const govInfo = getGovernmentInfo(government)

  // Filtrar cursos basado en el término de búsqueda
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses

    const term = searchTerm.toLowerCase()
    return courses.filter((course) => {
      return course.name.toLowerCase().includes(term) || course.abbr.toLowerCase().includes(term)
    })
  }, [searchTerm])

  const toggleCourse = (courseId: string) => {
    // Verificar si el curso ya está seleccionado para renovación
    if (renewalCourses.includes(courseId)) {
      alert("Este curso ya está seleccionado para renovación. No puedes seleccionarlo como curso nuevo.")
      return
    }

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
                  placeholder="Buscar por nombre o abreviación..."
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
                  const basePrice = getCourseBasePrice(course, nationality)
                  const finalPrice = calculateCoursePrice(course, nationality, government)
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
                            <span className="text-orange-600 ml-2">(Ya seleccionado para renovación)</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs text-gray-500 mt-1">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{course.abbr}</span>
                          {basePrice > 0 && !isInRenewal && (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                                ${finalPrice}
                              </span>
                              {govInfo.surcharge > 0 && (
                                <span className="text-xs text-orange-600 bg-orange-50 px-1 py-1 rounded">
                                  Base: ${basePrice} +{govInfo.surcharge}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </label>
                  )
                })
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
          {selectedCoursesData.map((course) => {
            const basePrice = getCourseBasePrice(course, nationality)
            const finalPrice = calculateCoursePrice(course, nationality, government)
            return (
              <div
                key={course.id}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-blue-900 text-sm leading-tight">{course.name}</h4>
                  <div className="flex items-center gap-3 text-blue-700 text-xs mt-2">
                    <span className="font-mono bg-blue-100 px-2 py-1 rounded">{course.abbr}</span>
                    {basePrice > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-green-600 bg-white px-2 py-1 rounded">${finalPrice}</span>
                        {govInfo.surcharge > 0 && (
                          <span className="text-xs text-orange-600 bg-orange-50 px-1 py-1 rounded">
                            Base: ${basePrice} +{govInfo.surcharge}%
                          </span>
                        )}
                      </div>
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
