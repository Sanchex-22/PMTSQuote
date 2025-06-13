"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function NotFound() {
  const [isHovering, setIsHovering] = useState(false)
  const navigate = useNavigate()

  const handleRefresh = () => {
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-extralight tracking-tighter text-black font-mono">404</h1>

        <p className="text-2xl md:text-4xl font-light text-black tracking-wide">No eres tú, somos nosotros</p>

        <button
          onClick={handleRefresh}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="mt-6 text-sm text-gray-600 hover:text-black transition-all duration-300 relative"
        >
          Refresh
          <span
            className={`absolute bottom-0 left-0 w-full h-px bg-gray-300 transform origin-left transition-transform duration-300 ${
              isHovering ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </button>
      </div>
    </div>
  )
}
