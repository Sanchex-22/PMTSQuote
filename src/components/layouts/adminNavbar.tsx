import { useState } from "react";
import { getMainRoutesForRole, getUserRoles } from "../../routes/routesConfig";
import { UserProfile } from "../../context/userProfileContext";
import Images from "../../assets";
import {
  LogOut, Menu, X, Users, BookOpen, UserCheck, FileText,
  ChevronRight, LayoutDashboard
} from "lucide-react";
import useUser from "../../hook/useUser";

interface CurrentPathname { name: string; }
interface AdminNavbarProps {
  currentPathname: CurrentPathname;
  isLogged: boolean;
  profile: UserProfile | null;
}

// Mapa de iconos por nombre de ruta
const routeIcons: Record<string, React.ReactNode> = {
  account:  <FileText className="h-4 w-4" />,
  users:    <Users className="h-4 w-4" />,
  courses:  <BookOpen className="h-4 w-4" />,
  clients:  <UserCheck className="h-4 w-4" />,
};

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  super_admin: 'Super Admin',
  moderator: 'Moderador',
  user: 'Usuario',
};

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  super_admin: 'bg-red-100 text-red-700',
  moderator: 'bg-blue-100 text-blue-700',
  user: 'bg-gray-100 text-gray-600',
};

function SidebarLink({ href, label, icon, onClick }: {
  href: string; label: string; icon?: React.ReactNode; onClick?: () => void;
}) {
  const isActive = window.location.pathname.startsWith(href);
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
        ${isActive
          ? 'bg-orange-50 text-orange-600 border border-orange-100'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
    >
      <span className={`flex-shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-600'}`}>
        {icon || <LayoutDashboard className="h-4 w-4" />}
      </span>
      <span className="flex-1 capitalize">{label}</span>
      {isActive && <ChevronRight className="h-3 w-3 text-orange-400" />}
    </a>
  );
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ profile }) => {
  const { logout } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userRoles = profile?.roles ? getUserRoles(profile) : ["user"];
  const navLinks = userRoles.flatMap((role: string) =>
    getMainRoutesForRole(role as any).map((route: any) => ({
      href: typeof route === "string" ? route : route.href,
      name: typeof route === "string" ? route : route.name,
    }))
  );

  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : 'US';
  const role = profile?.roles || 'user';

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <img src={Images?.pmts || "#"} alt="PMTS" width={36} height={36} className="rounded-lg" />
        <div>
          <p className="font-bold text-gray-800 text-sm leading-tight">PMTS Panel</p>
          <p className="text-xs text-gray-400">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Menú</p>
        {navLinks.map((link, i) => (
          <SidebarLink
            key={i}
            href={link.href}
            label={link.name}
            icon={routeIcons[link.name.toLowerCase()]}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 px-3 py-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{profile?.username || 'Usuario'}</p>
            <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium ${roleColors[role]}`}>
              {roleLabels[role] || role}
            </span>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP: sidebar fija ── */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-56 bg-white border-r border-gray-200 z-30">
        <SidebarContent />
      </aside>

      {/* ── MOBILE: top bar ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src={Images?.pmts || "#"} alt="PMTS" width={28} height={28} className="rounded-md" />
          <span className="font-bold text-gray-800 text-sm">PMTS Panel</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* ── MOBILE: drawer ── */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className={`md:hidden fixed top-0 left-0 h-screen w-72 bg-white z-50 shadow-2xl transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="absolute top-4 right-4">
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </div>
    </>
  );
};

export default AdminNavbar;
