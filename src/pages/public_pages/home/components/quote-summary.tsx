import type React from "react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { type Course } from "../../../../services/courses"

interface QuoteSummaryProps {
  selectedCourses: string[]
  selectedRenewalCourses: string[]
  government: string
  nationality: string
  availableCourses: Course[]
}

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({
  selectedCourses, selectedRenewalCourses, availableCourses,
}) => {
  const { t } = useTranslation()

  const { newCoursesData, renewalCoursesData } = useMemo(() => {
    const newCourses = selectedCourses
      .map(id => availableCourses.find(c => String(c.id) === id))
      .filter(Boolean) as Course[]

    const renewalCourses = selectedRenewalCourses
      .map(id => availableCourses.find(c => String(c.id) === id))
      .filter(Boolean) as Course[]

    return { newCoursesData: newCourses, renewalCoursesData: renewalCourses }
  }, [selectedCourses, selectedRenewalCourses, availableCourses])

  if (newCoursesData.length === 0 && renewalCoursesData.length === 0) return null

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t("Quote Summary")}</span>
      </div>

      <div className="divide-y divide-gray-100">
        {newCoursesData.length > 0 && (
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{t("New Courses")}</p>
            {newCoursesData.map(course => (
              <div key={course.id} className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-snug">{course.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {course.abbr && (
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{course.abbr}</span>
                  )}
                  {course.imo_no && (
                    <span className="text-xs text-gray-400">IMO {course.imo_no}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {renewalCoursesData.length > 0 && (
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">{t("Renewals")}</p>
            {renewalCoursesData.map(course => (
              <div key={course.id} className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-snug">{course.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {course.abbr && (
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{course.abbr}</span>
                  )}
                  {course.imo_no && (
                    <span className="text-xs text-gray-400">IMO {course.imo_no}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
