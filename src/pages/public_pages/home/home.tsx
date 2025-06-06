"use client"

import type React from "react"
import { useState, useRef, useMemo } from "react"
import { submitRegistration } from "../../../actions/actions"
import Images from "../../../assets"


export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg">
                <img src={Images.logo} alt="logo" width={70} height={70}/>
              </div>
              <h1 className="text-4xl font-light text-gray-900 mb-3">Ayudanos a Ayudarte</h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Que informacion necesitas?
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-light text-gray-900 mb-2">Información Personal</h2>
                  <p className="text-gray-600">Ingresa tus datos para completar el registro</p>
                </div>

              </div>
            </div>
  
      </div>
    </div>
  )
}
