import type React from "react"
import { courses } from "../../../../data/courses"
import { calculateCoursePrice, calculateRenewalPrice } from "../../../../utils/pricing"
import { DollarIcon } from "../../../../components/icons/icons"



interface QuoteSummaryProps {
  selectedCourses: string[]
  selectedRenewalCourses: string[]
  government: string
  nationality: string
}

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({
  selectedCourses,
  selectedRenewalCourses,
  government,
  nationality,
}) => {
  const selectedCoursesData = courses.filter((course) => selectedCourses.includes(String(course.id)))
  const selectedRenewalCoursesData = courses.filter((course) => selectedRenewalCourses.includes(String(course.id)))

  const newCoursesTotal = selectedCoursesData.reduce((total, course) => {
    return total + calculateCoursePrice(course, nationality, government)
  }, 0)

  const renewalCoursesTotal = selectedRenewalCoursesData.reduce((total, course) => {
    return total + calculateRenewalPrice(course, nationality, government)
  }, 0)

  const totalCost = newCoursesTotal + renewalCoursesTotal

  if (selectedCourses.length === 0 && selectedRenewalCourses.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
      <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
        <DollarIcon />
        Resumen de Cotización
      </h3>

      <div className="space-y-4 mb-4">
        {/* Cursos Nuevos */}
        {selectedCoursesData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2">Cursos Nuevos:</h4>
            <div className="space-y-2">
              {selectedCoursesData.map((course) => {
                const price = calculateCoursePrice(course, nationality, government)
                return (
                  <div key={course.id} className="flex justify-between items-center text-sm pl-4">
                    <span className="text-gray-700">{course.name}</span>
                    <span className="font-semibold text-green-700">${price}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between items-center text-sm font-semibold text-green-800 mt-2 pl-4 border-t border-green-200 pt-2">
              <span>Subtotal Cursos Nuevos:</span>
              <span>${newCoursesTotal}</span>
            </div>
          </div>
        )}

        {/* Cursos de Renovación */}
        {selectedRenewalCoursesData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-700 mb-2">Renovaciones:</h4>
            <div className="space-y-2">
              {selectedRenewalCoursesData.map((course) => {
                const price = calculateRenewalPrice(course, nationality, government)
                return (
                  <div key={course.id} className="flex justify-between items-center text-sm pl-4">
                    <span className="text-gray-700">
                      {course.name} <span className="text-orange-600">(Renovación)</span>
                    </span>
                    <span className="font-semibold text-orange-700">${price}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between items-center text-sm font-semibold text-orange-800 mt-2 pl-4 border-t border-orange-200 pt-2">
              <span>Subtotal Renovaciones:</span>
              <span>${renewalCoursesTotal}</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-green-200 pt-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-green-800">Total:</span>
          <span className="text-2xl font-bold text-green-800">${totalCost}</span>
        </div>
      </div>
    </div>
  )
}
