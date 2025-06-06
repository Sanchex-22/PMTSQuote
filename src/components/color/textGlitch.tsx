"use client"

import { useState, useEffect } from "react"

export default function GlitchText() {
  const [isGlitching, setIsGlitching] = useState(false)
  const [index, setIndex] = useState(0)

  const descriptions = ["Software", "Automatizaciones", "Desarrollo Web", "Aplicaciones"]
  const description = descriptions[index]

  useEffect(() => {
    // Cambia el texto cada 5 segundos
    const switchInterval = setInterval(() => {
      setIndex((prev) => (prev + 1) % descriptions.length)
    }, 3000)

    return () => clearInterval(switchInterval)
  }, [])

  useEffect(() => {
    // Aplica glitch aleatorio
    const glitchInterval = setInterval(() => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 200)
    }, Math.random() * 1000 + 2000)

    return () => clearInterval(glitchInterval)
  }, [])

  return (
    <p className="mb-4 max-w-md text-2xl leading-relaxed text-black font-bold md:text-4xl relative uppercase">
      <span
        className={`inline-block relative ${isGlitching ? "glitch-text" : ""}`}
        aria-label={description}
      >
        {description}
        {isGlitching && (
          <>
            <span className="glitch-text-before absolute top-0 left-0 w-full h-full" aria-hidden="true">
              {description}
            </span>
            <span className="glitch-text-after absolute top-0 left-0 w-full h-full" aria-hidden="true">
              {description}
            </span>
          </>
        )}
      </span>

      <style>{`
        .glitch-text {
          animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }

        .glitch-text-before {
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
          transform: translate(-5px, -3px);
          opacity: 0.8;
          color: #ff00ff;
        }

        .glitch-text-after {
          clip-path: polygon(0 80%, 100% 20%, 100% 100%, 0 100%);
          transform: translate(5px, 3px);
          opacity: 0.8;
          color: #00ffff;
        }

        @keyframes glitch {
          0%, 14% {
            text-shadow: 0.05em 0 0 rgba(255, 0, 255, 0.75),
                         -0.025em -0.05em 0 rgba(0, 255, 255, 0.75),
                         0.025em 0.05em 0 rgba(0, 255, 0, 0.75);
          }
          15%, 49% {
            text-shadow: -0.05em -0.025em 0 rgba(255, 0, 255, 0.75),
                         0.025em 0.025em 0 rgba(0, 255, 255, 0.75),
                         -0.05em -0.05em 0 rgba(0, 255, 0, 0.75);
          }
          50%, 99% {
            text-shadow: 0.025em 0.05em 0 rgba(255, 0, 255, 0.75),
                         0.05em 0 0 rgba(0, 255, 255, 0.75),
                         0 -0.05em 0 rgba(0, 255, 0, 0.75);
          }
          100% {
            text-shadow: -0.025em 0 0 rgba(255, 0, 255, 0.75),
                         -0.025em -0.025em 0 rgba(0, 255, 255, 0.75),
                         -0.025em -0.05em 0 rgba(0, 255, 0, 0.75);
          }
        }
      `}</style>
    </p>
  )
}
