"use client"

import { useState, useEffect } from "react"

type Country = "honduras" | "panama" | "guatemala"

interface CountrySelectorToggleProps {
  onCountryChange?: (country: Country) => void
  defaultCountry?: Country
}

const countries = [
  { code: "honduras", name: "Honduras", flag: "🇭🇳" },
  { code: "panama", name: "Panamá", flag: "🇵🇦" },
  { code: "guatemala", name: "Guatemala", flag: "🇬🇹" },
] as const

const CountrySelectorToggle = ({ onCountryChange, defaultCountry = "honduras" }: CountrySelectorToggleProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(defaultCountry)

  useEffect(() => {
    localStorage.setItem("selectedCountry", selectedCountry)
  }, [selectedCountry])

  const selectCountry = (country: Country) => {
    setSelectedCountry(country)
    onCountryChange?.(country)
  }

  const getSlidePosition = () => {
    switch (selectedCountry) {
      case "honduras":
        return "translate-x-0"
      case "panama":
        return "translate-x-full"
      case "guatemala":
        return "translate-x-[200%]"
      default:
        return "translate-x-0"
    }
  }

  return (
    <div className="p-4">
      <div className="relative inline-flex bg-gray-200 rounded-full p-1">
        {/* Indicador deslizante */}
        <div
          className={`
            absolute top-1 bottom-1 w-1/3 bg-green-600 rounded-full shadow-sm
            transition-transform duration-300 ease-in-out
            ${getSlidePosition()}
          `}
        />

        {countries.map((country) => (
          <button
            key={country.code}
            onClick={() => selectCountry(country.code as Country)}
            className={`
              relative z-10 flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              ${selectedCountry === country.code ? "text-white" : "text-gray-600 hover:text-gray-800"}
            `}
            aria-label={`Seleccionar ${country.name}`}
          >
            <span className="text-sm">{country.flag}</span>
            <span className="hidden sm:inline">{country.name}</span>
            <span className="sm:hidden">{country.code.slice(0, 3).toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CountrySelectorToggle
