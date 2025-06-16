import type React from "react"
import { useMemo } from "react" // <--- Importa useMemo
import { useTranslation } from "react-i18next" // <--- Importa useTranslation
// REMOVER: import { courses } from "../../../../data/courses" // <--- Elimina esta línea
import { calculateCoursePrice, calculateRenewalPrice } from "../../../../utils/pricing" // <--- Agrega getGovernmentInfo
import { DollarIcon } from "../../../../components/icons/icons"
import { type Course } from "../../../../services/courses" // <--- Importa la interfaz Course desde tu servicio

interface QuoteSummaryProps {
  selectedCourses: string[]
  selectedRenewalCourses: string[]
  government: string
  nationality: string
  availableCourses: Course[] // <--- Nueva prop para los cursos de la API
}

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({
  selectedCourses,
  selectedRenewalCourses,
  government,
  nationality,
  availableCourses, // Asegúrate de desestructurar availableCourses
}) => {
  const { t } = useTranslation() // Inicializa el hook de traducción

  // Usa useMemo para calcular los datos y totales solo cuando las dependencias cambian
  const { newCoursesData, renewalCoursesData } = useMemo(() => {
    // Filtra para obtener los objetos Course completos para los cursos seleccionados
    const newCourses = selectedCourses
      .map(id => availableCourses.find(course => String(course.id) === id))
      .filter(Boolean) as Course[]; // `filter(Boolean)` para remover `undefined` si algún ID no se encuentra

    const renewalCourses = selectedRenewalCourses
      .map(id => availableCourses.find(course => String(course.id) === id))
      .filter(Boolean) as Course[];

    // Calcula los totales
    const newTotal = newCourses.reduce(
      (sum, course) => sum + calculateCoursePrice(course, nationality, government),
      0,
    );
    const renewalTotal = renewalCourses.reduce(
      (sum, course) => sum + calculateRenewalPrice(course, nationality, government),
      0,
    );
    const overallTotal = newTotal + renewalTotal;

    return {
      newCoursesData: newCourses,
      renewalCoursesData: renewalCourses,
      renewalCoursesTotal: renewalTotal,
      totalCost: overallTotal,
    };
  }, [selectedCourses, selectedRenewalCourses, government, nationality, availableCourses]); // Dependencias para useMemo

  // No renderizar nada si no hay cursos seleccionados
  if (newCoursesData.length === 0 && renewalCoursesData.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
      <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
        <DollarIcon />
        {t("Quote Summary")} {/* <--- CAMBIO: Usar t() */}
      </h3>

      <div className="space-y-4 mb-4">
        {/* Cursos Nuevos */}
        {newCoursesData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-700 mb-2">{t("New Courses:")}</h4> {/* <--- CAMBIO: Usar t() */}
            <div className="space-y-2">
              {newCoursesData.map((course) => {
                return (
                  <div key={course.id} className="flex justify-between items-center text-sm pl-4">
                    <span className="text-gray-700">{course.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cursos de Renovación */}
        {renewalCoursesData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-orange-700 mb-2">{t("Renewals:")}</h4> {/* <--- CAMBIO: Usar t() */}
            <div className="space-y-2">
              {renewalCoursesData.map((course) => {
                return (
                  <div key={course.id} className="flex justify-between items-center text-sm pl-4">
                    <span className="text-gray-700">
                      {course.name} <span className="text-orange-600">({t("Renewal")})</span> {/* <--- CAMBIO: Usar t() */}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-sm font-semibold text-orange-800 mt-2 pl-4 border-t border-orange-200 pt-2">
            </div>
          </div>
        )}
      
      </div>
    </div>
  );
};