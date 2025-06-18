"use client"; // ¡Importante!

import { useState } from "react"; // Para mostrar el nombre del archivo seleccionado
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
  CheckCircle, // Para feedback
  AlertTriangle, // Para feedback
} from "lucide-react";
import { submitMedicalCertificate } from "../../../../actions/PhysicalActions";

// Componente auxiliar para el input de archivo con feedback visual
function FileInput({
  name,
  label,
  subLabel,
  accept,
  required,
}: {
  name: string;
  label: string;
  subLabel?: string;
  accept: string;
  required?: boolean;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null); // No preview for non-images like PDF
      }
    } else {
      setFileName(null);
      setFilePreview(null);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {subLabel && <span className="block text-xs text-gray-500 font-normal">{subLabel}</span>}
      </label>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor={name} // Conectar label con input
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {filePreview && <img src={filePreview} alt="Preview" className="max-h-16 mb-1 object-contain" />}
          {!filePreview && <Upload className="w-6 h-6 mb-1 text-gray-400" />}
          <p className="text-xs text-gray-500 px-2 text-center">
            {fileName ? fileName : "Subir archivo (PDF, Imagen)"}
          </p>
          <input
            id={name} // Para que el label funcione
            type="file"
            name={name}
            accept={accept}
            required={required}
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
    </div>
  );
}


export default function MedicalCertificateForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Prevenir el comportamiento por defecto si queremos manejar el estado
    setIsSubmitting(true);
    setSubmissionStatus(null);

    const formData = new FormData(event.currentTarget);
    const result = await submitMedicalCertificate(formData);

    setSubmissionStatus(result);
    setIsSubmitting(false);

    if (result.success) {
      // Opcional: Resetear el formulario
      // (event.target as HTMLFormElement).reset();
      // O redirigir, o mostrar un mensaje de éxito más persistente
      console.log("Formulario enviado con éxito:", result.message);
    } else {
      console.error("Error al enviar el formulario:", result.message);
    }
  }


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
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
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
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                    placeholder="Ej: Capitán, Ingeniero, Cocinero"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo / Complete Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                    placeholder="Nombre completo"
                  />
                </div>
              </div>

              {/* ===== CAMPO AGREGADO ===== */}
              <FileInput
                name="documento_identidad"
                label="Documento de Identidad / Identity Document"
                subLabel="Pasaporte o Cédula / Passport or ID Card"
                accept=".pdf,image/*"
                required
              />
              {/* ===== FIN DEL CAMPO AGREGADO ===== */}

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
                      required
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
                      required
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
                    required
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
                  {/* Cambiado a un select para mejor UX */}
                  <select
                    id="gafas"
                    name="gafas"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors appearance-none bg-white"
                  >
                    <option value="">Seleccione...</option>
                    <option value="Sí">Sí / Yes</option>
                    <option value="No">No / No</option>
                  </select>
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
                    placeholder="Describa cualquier condición médica actual (o N/A)"
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
                    placeholder="Medicamentos actuales (o N/A)"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cirugia" className="block text-sm font-medium text-gray-700 mb-2">
                  Última Cirugía / Last Surgery
                  <span className="block text-xs text-gray-500 font-normal mt-1">
                    (si aplica, indicar fecha, razón y condición actual, o N/A)
                  </span>
                </label>
                <div className="relative">
                  <Scissors className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    id="cirugia"
                    name="cirugia"
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors resize-none"
                    placeholder="Fecha, tipo de cirugía y estado actual (o N/A)"
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
                    placeholder="Tipo de vacuna y dosis (o N/A)"
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
                      placeholder="Fecha del último test (o N/A)"
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
                <p className="text-sm text-gray-600 mb-6">Physical Examinations for Panama and Cook's license (si no aplica, puede dejarlos vacíos)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileInput name="blood_count" label="Hemograma completo / Blood count" accept=".pdf,image/*" />
                <FileInput name="chemistry" label="Química (Creatinina, Glucosa) / Chemistry" accept=".pdf,image/*" />
                <FileInput name="rh_type" label="Tipo RH / RH type" accept=".pdf,image/*" />
                <FileInput name="drug_test" label="Prueba de drogas / Drug Test" accept=".pdf,image/*" />
                <FileInput name="urinalysis" label="Análisis de orina / Urinalysis" accept=".pdf,image/*" />
                <FileInput name="stool_test" label="Examen de heces / Stool test" accept=".pdf,image/*" />
              </div>
            </div>

            {/* Mensajes de estado de envío */}
            {submissionStatus && (
              <div className={`p-4 rounded-md text-sm ${submissionStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} flex items-center gap-2`}>
                {submissionStatus.success ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                {submissionStatus.message}
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-4 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Enviar Formulario
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}