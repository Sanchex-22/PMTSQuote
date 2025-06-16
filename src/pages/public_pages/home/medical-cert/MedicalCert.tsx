"use client"

import {
  User,
  Weight,
  Ruler,
  MapPin,
  Eye,
  Heart,
  Pill,
  Scissors,
  Shield,
  TestTube,
  Upload,
  Send,
  Stethoscope,
} from "lucide-react"

export default function MedicalCertificateForm() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="text-center py-8 px-6 border-b border-gray-50">
            <div className="flex items-center justify-center mb-3">
              <Stethoscope className="w-8 h-8 text-gray-600 mr-2" />
            </div>
            <h1 className="text-2xl font-light text-gray-900 mb-2">Formulario para Certificado Médico</h1>
            <p className="text-sm text-gray-600">Medical Certificate Form</p>
          </div>

          {/* Form */}
          <form className="p-6 space-y-8">
            {/* Información Personal */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">
                Información Personal / Personal Information
              </h3>

              <div>
                <label htmlFor="posicion" className="block text-sm font-medium text-gray-700 mb-2">
                  Posición a Bordo / Position on-board
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="posicion"
                    name="posicion"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                    placeholder="Ej: Capitán, Ingeniero, Cocinero"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre / Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                    placeholder="Nombre completo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="peso" className="block text-sm font-medium text-gray-700 mb-2">
                    Peso / Weight
                  </label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      id="peso"
                      name="peso"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                      placeholder="70 kg"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="altura" className="block text-sm font-medium text-gray-700 mb-2">
                    Altura / Height
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      id="altura"
                      name="altura"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                      placeholder="1.75 m"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección / Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                    placeholder="Dirección completa"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gafas" className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Usa gafas? / Eyeglasses
                </label>
                <div className="relative">
                  <Eye className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="gafas"
                    name="gafas"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                    placeholder="Sí / No"
                  />
                </div>
              </div>
            </div>

            {/* Información Médica */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">
                Información Médica / Medical Information
              </h3>

              <div>
                <label htmlFor="condiciones" className="block text-sm font-medium text-gray-700 mb-2">
                  Condiciones Médicas / Medical Conditions
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    id="condiciones"
                    name="condiciones"
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors resize-none"
                    placeholder="Describa cualquier condición médica actual"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="prescripcion" className="block text-sm font-medium text-gray-700 mb-2">
                  Prescripción Médica / Medical Prescription
                </label>
                <div className="relative">
                  <Pill className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    id="prescripcion"
                    name="prescripcion"
                    rows={2}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors resize-none"
                    placeholder="Medicamentos actuales"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cirugia" className="block text-sm font-medium text-gray-700 mb-2">
                  Última Cirugía / Last Surgery
                  <span className="block text-xs text-gray-500 font-normal mt-1">
                    (si aplica, indicar fecha, razón y condición actual)
                  </span>
                </label>
                <div className="relative">
                  <Scissors className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    id="cirugia"
                    name="cirugia"
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors resize-none"
                    placeholder="Fecha, tipo de cirugía y estado actual"
                  />
                </div>
              </div>
            </div>

            {/* Información COVID */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">
                Información COVID / COVID Information
              </h3>

              <div>
                <label htmlFor="tipo_vacuna" className="block text-sm font-medium text-gray-700 mb-2">
                  Vacuna COVID / COVID Vaccine (Pfizer, AstraZeneca, Johnson, etc.)
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="tipo_vacuna"
                    name="tipo_vacuna"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                    placeholder="Tipo de vacuna y dosis"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ultimo_positivo" className="block text-sm font-medium text-gray-700 mb-2">
                    Última vez positivo / Last time positive
                  </label>
                  <div className="relative">
                    <TestTube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      id="ultimo_positivo"
                      name="ultimo_positivo"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                      placeholder="Fecha o N/A"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="ultimo_test" className="block text-sm font-medium text-gray-700 mb-2">
                    Último test COVID / Last COVID Test
                  </label>
                  <div className="relative">
                    <TestTube className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      id="ultimo_test"
                      name="ultimo_test"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                      placeholder="Fecha del último test"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Exámenes Físicos */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-4">
                  Exámenes Físicos Solo Panamá y para licencia de Cocinero
                </h3>
                <p className="text-sm text-gray-600 mb-6">Physical Examinations for Panama and Cook's license</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hemograma completo / Blood count
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Upload className="w-6 h-6 mb-1 text-gray-400" />
                        <p className="text-xs text-gray-500">Subir archivo</p>
                      </div>
                      <input type="file" name="blood_count" accept=".pdf,image/*" required className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Química (Creatinina, Glucosa) / Chemistry
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Upload className="w-6 h-6 mb-1 text-gray-400" />
                        <p className="text-xs text-gray-500">Subir archivo</p>
                      </div>
                      <input type="file" name="chemistry" accept=".pdf,image/*" required className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo RH / RH type</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Upload className="w-6 h-6 mb-1 text-gray-400" />
                        <p className="text-xs text-gray-500">Subir archivo</p>
                      </div>
                      <input type="file" name="rh_type" accept=".pdf,image/*" required className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prueba de drogas / Drug Test</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Upload className="w-6 h-6 mb-1 text-gray-400" />
                        <p className="text-xs text-gray-500">Subir archivo</p>
                      </div>
                      <input type="file" name="drug_test" accept=".pdf,image/*" required className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Análisis de orina / Urinalysis</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Upload className="w-6 h-6 mb-1 text-gray-400" />
                        <p className="text-xs text-gray-500">Subir archivo</p>
                      </div>
                      <input type="file" name="urinalysis" accept=".pdf,image/*" required className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Examen de heces / Stool test</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <Upload className="w-6 h-6 mb-1 text-gray-400" />
                        <p className="text-xs text-gray-500">Subir archivo</p>
                      </div>
                      <input type="file" name="stool_test" accept=".pdf,image/*" required className="hidden" />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Enviar Formulario
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
