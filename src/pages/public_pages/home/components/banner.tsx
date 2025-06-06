import Images from '../../../../assets'
import GlitchText from '../../../../components/color/textGlitch'

export default function Banner() {
  return (
    <section
      id="hero"
      className="relative z-10 bg-black min-h-[35rem] lg:h-[80vh] max-h-[55rem] w-full flex items-center justify-center"
    >
      {/* Background Image */}
      <img
        src={Images.banner || "#"}
        alt="banner"
        className="absolute inset-0 h-full w-full object-cover object-[center_70%] z-0"
      />

      {/* Gradient Overlay */}
      <div className="z-10 absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-90" />

      {/* Content */}
      <div className="relative z-20 grid grid-cols-1 md:grid-cols-2 w-full max-w-7xl px-6 py-10 lg:py-32 gap-8 items-center">
        
        {/* Texto a la izquierda */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Transforma tu negocio
            <GlitchText />
          </h1>
          <a
            href="#contact"
            className="inline-block text-lg text-white border-2 border-red-500 rounded-md px-4 py-2 bg-red-500 mt-4"
          >
            Contáctanos
          </a>
        </div>

        {/* Imagen/aliado a la derecha */}
        <div className="flex justify-center items-center">
          <img
            src={Images.banner || Images.banner}
            alt="CiberSoft ERP"
            className="w-full max-w-md rounded-xl shadow-xl origin-center md:origin-top "
          />
        </div>
      </div>
    </section>
  )
}
