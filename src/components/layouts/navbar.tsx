"use client"

import type React from "react"
import { useEffect } from "react"
import type { UserProfile } from "../../context/userProfileContext"

interface CurrentPathname {
  name: string
}

interface NavbarProps {
  currentPathname: CurrentPathname
  isLogged?: boolean
  profile: UserProfile | null
}

const Navbar: React.FC<NavbarProps> = ({ currentPathname }) => {
  const isHome = currentPathname?.name === "/";

  const nav_links = [
    { name: "PmtsQ", href: "/" },
    { name: "Projectos", href: isHome ? "#projects" : "/#projects" },
    { name: "Servicios", href: isHome ? "#services" : "/#services" },
    { name: "Nosotros", href: isHome ? "#about-us" : "/#about-us" },
    { name: "Contactanos", href: isHome ? "#contact" : "/#contact" },
  ];

  useEffect(() => {
    const navbar = document.getElementById("navbar")

    function handleScroll() {
      if (window.scrollY > 0) {
        navbar?.classList.add("scrolled")
      } else {
        navbar?.classList.remove("scrolled")
      }
    }
    window.addEventListener("scroll", handleScroll)


  }, [])

  const isActive = (path: string) => currentPathname.name === path

  return (
    <nav
      id="navbar"
      className={`text-transition w-full fixed z-20 transition-all duration-500 bg-white/95 backdrop-blur-sm border-b border-gray-100 ${
        currentPathname.name === "/" ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">

          <div className="flex-shrink-0">
            <a
              href="/"
              className="text-red-600 font-bold text-xl hover:text-red-700 transition-colors duration-300"
            >
              PmtsQ
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {nav_links.map(
              (link, index) =>
                index !== 0 && (
                  <a
                    key={index}
                    href={link.href}
                    className={`relative py-2 text-base font-medium transition-colors
                      after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-orange-600 after:transition-all after:duration-300 hover:after:w-full
                      ${isActive(link.href) ? "text-red-900 after:w-full" : "text-red-600 hover:text-orange-600"}`}
                  >
                    {link.name}
                  </a>
                ),
            )}
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar
