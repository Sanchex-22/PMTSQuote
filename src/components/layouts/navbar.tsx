"use client";
import type React from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, LayoutDashboard } from "lucide-react";
import Images from "../../assets";
import type { UserProfile } from "../../context/userProfileContext";

interface CurrentPathname {
  name: string;
}

interface NavbarProps {
  currentPathname?: CurrentPathname;
  isLogged?: boolean;
  profile: UserProfile | null;
}

const ADMIN_ROLES = ["admin", "moderator", "super_admin"];

const Navbar: React.FC<NavbarProps> = ({ currentPathname, isLogged, profile }) => {
  const isAdmin = ADMIN_ROLES.includes(profile?.roles ?? "");
  const { i18n, t } = useTranslation();
  const isHome = currentPathname?.name === "/";
  // i18n "en" = Spanish mode, i18n "es" = English mode (inverted by design)
  const isSpanish = i18n.language !== "es";

  const toggleLang = () => {
    const next = isSpanish ? "es" : "en";
    i18n.changeLanguage(next);
    localStorage.setItem("i18nextLng", next);
  };

  return (
    <nav className="w-full z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100 select-none">
      <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-3">

        {/* Left */}
        {isHome ? (
          <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <img src={Images?.pmts || "#"} alt="PMTS logo" width={36} height={36} className="rounded-lg" />
            <span className="font-bold text-sm tracking-wider text-gray-800">PMTS</span>
          </a>
        ) : (
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>{t("Home")}</span>
          </a>
        )}

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Language pill toggle */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 h-8 px-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-xs font-semibold text-gray-700"
            aria-label="Cambiar idioma"
          >
            <span>{isSpanish ? "🇪🇸" : "🇺🇸"}</span>
            <span>{isSpanish ? "ES" : "EN"}</span>
          </button>

          {/* Panel shortcut — visible only on hover, blends into background for non-staff */}
          <a
            href={isLogged && isAdmin ? "/account/quotes" : "/login"}
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-200 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
            aria-label="Panel"
            title="Panel"
          >
            <LayoutDashboard className="w-4 h-4" />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
