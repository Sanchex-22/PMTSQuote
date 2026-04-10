"use client"

import type React from "react"

interface CustomButtonProps {
  type?: "button" | "submit"
  onClick?: () => void
  disabled?: boolean
  variant?: "primary" | "secondary"
  children: React.ReactNode
  className?: string
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  type = "button", onClick, disabled = false, variant = "primary", children, className = "",
}) => {
  const base = "w-full h-14 px-6 rounded-2xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98]"

  const variants = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md",
    secondary: "bg-gray-800 text-white hover:bg-gray-900 focus:ring-4 focus:ring-gray-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed",
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}
