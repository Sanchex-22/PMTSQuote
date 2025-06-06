import { HiMenu } from "react-icons/hi";
import { useEffect } from "react";
import { getMainRoutesForRole, getUserRoles } from "../../routes/routesConfig";
import ProfileButton from "../buttons/profile_button";
import { UserProfile } from "../../context/userProfileContext";
import Images from "../../assets";

interface CurrentPathname {
  name: string;
}

interface AdminNavbarProps {
  currentPathname: CurrentPathname;
  isLogged: boolean;
  profile: UserProfile | null;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({
  currentPathname,
  profile,
}) => {
  const userRoles = profile?.roles ? getUserRoles(profile) : [];
  const filteredNavLinks: { href: string; name: string }[] = userRoles.flatMap((role: string) =>
    getMainRoutesForRole(role as "user" | "super_admin" | "admin" | "moderator").map((route: { href: string; name: string } | string) => ({
      href: typeof route === "string" ? route : route.href,
      name: typeof route === "string" ? route : route.name,
    }))
  ) || [];
  useEffect(() => {
    const navbar = document.getElementById("navbar");

    const handleScroll = () => {
      if (window.scrollY > 0) {
        navbar?.classList.add("scrolled");
      } else {
        navbar?.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);

    const openButton = document?.getElementById("open-menu");
    const side = document?.getElementById("sidebar");

    if (!openButton) return;
    const openMenu = () => {
      document.body.classList.add("overflow-hidden");
      side?.classList.remove("invisible", "translate-x-full", "hidden");
    };
    openButton.addEventListener("click", openMenu);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      openButton.removeEventListener("click", openMenu);
    };
  }, []);

  return (
    <nav
      id="navbar"
      className={`w-full flex justify-center h-12 md:h-16 z-20 mb-16 ${
        currentPathname.name === "/"
          ? ""
          : "bg-gradient-to-r from-white via-white/80 to-white/90 border-b-2 border-black/20"
      }`}
    >
      <div className="max-w-7xl mx-auto main-content w-full px-6 md:px-5 flex justify-between h-12 md:h-16 items-center *:text-black">
        <div className="flex *:px-4 items-center h-full">
          <img src={Images.logoColor || "#"} className="w-16 h-16" />
          {filteredNavLinks.length > 0 ? (
            filteredNavLinks.map((link, index) => (
              <div key={index}>
                <a
                  href={link.href}
                  className="hidden md:block hover:text-chocolate-200 text-lg font-bold h-full duration-500 select-none"
                >
                  {link.name}
                </a>
              </div>
            ))
          ) : (
            <span className="text-lg text-gray-500">No tienes acceso a ninguna ruta</span>
          )}
        </div>
        <div className="h-full flex items-center">
          <ProfileButton profile={profile} />
          <HiMenu
            id="open-menu"
            className="block md:hidden h-full"
            fontSize={30}
          />
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
