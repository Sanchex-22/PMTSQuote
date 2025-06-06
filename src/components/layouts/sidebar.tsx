import React, { useEffect } from "react";

// Definición de los enlaces de navegación
const navLink = [
  { name: "Home", href: "/" },
  { name: "Productos", href: "/productos" },
  { name: "Nosotros", href: "/nosotros" },
];

const Sidebar: React.FC = () => {
  useEffect(() => {
    const body = document.querySelector("body");
    const closeButton = document.getElementById("close-menu");
    const side = document.getElementById("sidebar");

    if (!side || !body || !closeButton) {
      console.error("No button or nav found");
      return;
    }

    // Función para cerrar el menú
    function closeMenu() {
      body!.classList.remove("overflow-hidden");
      side!.classList.add("invisible", "translate-x-full", "hidden");
    }

    // Agregar evento de cierre del menú al botón
    closeButton.addEventListener("click", closeMenu);

    // Limpiar evento al desmontar el componente
    return () => {
      closeButton.removeEventListener("click", closeMenu);
    };
  }, []);

  return (
    <aside
      id="sidebar"
      className="sidebar-blur text-white z-40 min-w-screen md:hidden absolute invisible inset-0 m-0 h-screen overflow-hidden p-0 transition-opacity flex flex-col justify-between items-center duration-500"
    >
      <div className="flex flex-col text-center w-full">
        <div className="h-16 flex justify-between py-1 px-8 border-b-2 border-slate-50 border-opacity-20">
          <p className="py-4 font-semibold text-lg text-center">ePanel</p>
          <button
            id="close-menu"
            aria-label="close-menu"
            className="block font-bold md:hidden"
          >
            X
          </button>
        </div>
        <div className="w-full h-screen flex flex-col gap-y-5 justify-center items-center">
          {navLink.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-orange-500 duration-500 font-semibold text-lg"
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      <footer className="my-5 text-sm select-none hover:text-orange-500">
        <p>ePanel Copyright - {new Date().getFullYear()}</p>
      </footer>
    </aside>
  );
};

export default Sidebar;
