"use client";

import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Upload,
  Send,
} from "lucide-react";
import Images from "../../../../assets";
import { t } from "i18next";

export default function LicenseQuote() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="text-center my-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
              <img
                src={Images.logo || "/placeholder.svg"}
                alt="logo"
                width={70}
                height={70}
              />
            </div>
            <h1 className="text-2xl font-light text-gray-900 mb-2">
                {t("License Application")}
            </h1>
            <p className="text-sm text-gray-600">
              {t("Complete the form to receive personalized information")}
            </p>
          </div>

          {/* Form */}
          <form className="p-6 space-y-6">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nombre
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                    placeholder="Juan"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="apellido"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Apellido
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                    placeholder="Pérez"
                  />
                </div>
              </div>
            </div>

            {/* Correo */}
            <div>
              <label
                htmlFor="correo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                  placeholder="juan@ejemplo.com"
                />
              </div>
            </div>

            {/* Teléfono */}
            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label
                htmlFor="direccion"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Dirección Física
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors"
                  placeholder="Calle Principal 123, Ciudad"
                />
              </div>
            </div>

            {/* Documento */}
            <div>
              <label
                htmlFor="documento"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cédula o Pasaporte
              </label>
              <div className="relative">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="documento"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-medium">
                          Haga clic para subir
                        </span>{" "}
                        o arrastre aquí
                      </p>
                      <p className="text-xs text-gray-400">
                        PDF, JPG, PNG (MAX. 10MB)
                      </p>
                    </div>
                    <input
                      id="documento"
                      name="documento"
                      type="file"
                      accept="image/*,.pdf"
                      required
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Información sobre licencias */}
            <div>
              <label
                htmlFor="licencias"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Información sobre las licencias
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  id="licencias"
                  name="licencias"
                  rows={4}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-colors resize-none"
                  placeholder="Escriba aquí su consulta sobre las licencias que necesita..."
                />
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Enviar Solicitud
            </button>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              En poco tiempo estaremos contactándole.
            </p>
            <p className="text-sm text-gray-700 font-medium mt-1">
              ¡Gracias por su interés!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
