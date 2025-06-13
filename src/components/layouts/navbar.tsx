"use client"
import type React from "react"
import { useEffect } from "react"
import type { UserProfile } from "../../context/userProfileContext"
import LanguageSwitcher from "../buttons/languageSwitcher"
import { ChevronLeft } from "lucide-react"

interface CurrentPathname {
  name: string
}

interface NavbarProps {
  currentPathname?: CurrentPathname
  isLogged?: boolean
  profile: UserProfile | null
}

const Navbar: React.FC<NavbarProps> = ({ currentPathname }) => {
  // const isHome = currentPathname?.name === "/";
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

  return (
    <nav
      id="navbar"
      className={`text-transition w-full z-20 transition-all duration-500 bg-white/95 backdrop-blur-sm border-b border-gray-100 ${
        currentPathname?.name === "/" ? "shadow-sm" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">

          <div className="flex-shrink-0">
            <a
              href="/"
              className="text-white font-bold text-xl hover:text-white transition-colors duration-300"
            >
              <ChevronLeft color="black" />
            </a>
          </div>

          <div className="flex justify-center">
             <LanguageSwitcher />
          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar
