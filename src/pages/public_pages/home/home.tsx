"use client";

import Images from "../../../assets";
import { useTranslation } from "react-i18next";
import { BookOpen, FileText, Stethoscope, Globe2, BookAIcon, ChevronRight } from "lucide-react";

interface NavLink {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
}

export default function Home() {
  const { t } = useTranslation();

  const links: NavLink[] = [
    {
      href: "/courses",
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      iconBg: "bg-blue-50",
      title: t("Courses"),
      description: t("Request a quote for maritime courses"),
    },
    {
      href: "/Licenses",
      icon: <FileText className="w-5 h-5 text-indigo-600" />,
      iconBg: "bg-indigo-50",
      title: t("License Procedure"),
      description: t("Maritime license documentation and renewal"),
    },
    {
      href: "/medical",
      icon: <Stethoscope className="w-5 h-5 text-green-600" />,
      iconBg: "bg-green-50",
      title: t("Physical Examination"),
      description: t("Medical fitness certificate for seafarers"),
    },
    {
      href: "/liberian",
      icon: <Globe2 className="w-5 h-5 text-purple-600" />,
      iconBg: "bg-purple-50",
      title: t("Liberia COC"),
      description: t("Certificate of Competency – Liberian Registry"),
    },
    {
      href: "/evaluation",
      icon: <BookAIcon className="w-5 h-5 text-orange-500" />,
      iconBg: "bg-orange-50",
      title: t("Instructor Evaluation"),
      description: t("Evaluation form for maritime instructors"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-0 sm:px-4 py-0 sm:py-10">
      <div className="w-full max-w-lg">
        <div className="bg-white sm:rounded-3xl sm:shadow-xl sm:border sm:border-gray-100 overflow-hidden min-h-screen sm:min-h-0">

          {/* Header */}
          <div className="px-6 pt-12 pb-8 text-center bg-gradient-to-b from-blue-50 to-white border-b border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg mb-5">
              <img src={Images.logo} alt="logo" width={52} height={52} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1.5">
              {t("Help Us Help You")}
            </h1>
            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
              {t("Select the service you need and we'll guide you through the process.")}
            </p>
          </div>

          {/* Links */}
          <div className="px-4 py-5 space-y-2.5">
            {links.map(({ href, icon, iconBg, title, description }) => (
              <a
                key={href}
                href={href}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl px-4 py-4 hover:border-gray-200 hover:shadow-sm active:scale-[0.98] transition-all duration-150 group"
              >
                <div className={`flex-shrink-0 w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-snug truncate">{description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-gray-400 transition-colors" />
              </a>
            ))}
          </div>

          {/* Footer note */}
          <div className="px-6 pb-8 pt-2 text-center">
            <p className="text-xs text-gray-300">{t("Panama Maritime Training Solutions")}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
