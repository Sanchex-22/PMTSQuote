"use client";

import Images from "../../../assets";
import { useTranslation } from "react-i18next";
import { BookOpen, FileText, Stethoscope, Globe2, BookAIcon } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();

  const links = [
    {
      href: "/courses",
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      title: t("Courses"),
    },
    {
      href: "/Licenses",
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
      title: t("License Procedure"),
    },
    {
      href: "/medical",
      icon: <Stethoscope className="w-6 h-6 text-green-600" />,
      title: t("Physical Examination"),
    },
    {
      href: "/liberian",
      icon: <Globe2 className="w-6 h-6 text-purple-600" />,
      title: t("Liberia COC"),
    },
    {
      href: "/evaluation",
      icon: <BookAIcon className="w-6 h-6 text-red-600" />,
      title: t("Instructor Evaluation"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all">
          <div className="p-4 md:p-10 space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-md mb-4">
                <img src={Images.logo} alt="logo" width={60} height={60} />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                {t("Help Us Help You")}
              </h1>
              <p className="text-md text-gray-600 max-w-sm mx-auto">
                {t("What information do you need?")}
              </p>
            </div>

            <div className="space-y-4">
              {links.map(({ href, icon, title }) => (
                <a
                  key={href}
                  href={href}
                  className="flex items-center gap-4 bg-white border border-blue-100 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-all hover:scale-[0.98] hover:bg-blue-50 group"
                >
                  <div className="flex-shrink-0">{icon}</div>
                  <span className="text-blue-900 font-medium text-lg group-hover:text-blue-700">
                    {title}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
