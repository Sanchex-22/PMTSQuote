"use client"

import type React from "react"

interface CustomInputProps {
  id: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  required?: boolean
  icon?: React.ReactNode
}

export const CustomInput: React.FC<CustomInputProps> = ({
  id, type = "text", value, onChange, placeholder, required = false, icon,
}) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={`w-full h-14 text-base bg-white border border-gray-200 rounded-2xl
          px-4 ${icon ? "pl-11" : ""}
          text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
          hover:border-gray-300 transition-all duration-200`}
      />
    </div>
  )
}
