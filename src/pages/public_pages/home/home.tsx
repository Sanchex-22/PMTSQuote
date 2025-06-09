"use client";

import Images from "../../../assets";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../../components/buttons/languageSwitcher";

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
            <img src={Images.logo} alt="logo" width={70} height={70} />
          </div>
          <h1 className="text-4xl font-light text-gray-900 mb-3">
            {t('Ayudanos a Ayudarte')}
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            {t('Que informacion necesitas?')}
          </p>

          <div className="flex justify-center">
             <LanguageSwitcher />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 space-y-6">
            <a
              href="/courses"
              className="block bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 text-lg font-semibold text-blue-900 w-full h-full hover:scale-[98%] transition-transform duration-200 ease-in-out"
            >
              { t('Cursos') }
            </a>
            <a
              href="#"
              className="block bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 text-lg font-semibold text-blue-900 w-full h-full hover:scale-[98%] transition-transform duration-200 ease-in-out"
            >
              { t('Tramite de Licencia') }
            </a>
            <a
              href="#"
              className="block bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 text-lg font-semibold text-blue-900 w-full h-full hover:scale-[98%] transition-transform duration-200 ease-in-out"
            >
              { t('Liberia COC') }
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
