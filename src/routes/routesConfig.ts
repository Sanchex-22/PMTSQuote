
import { UserProfile } from "../context/userProfileContext";
import { authRoles } from "../diccionary/constants";
import { FaMoneyBill } from "react-icons/fa";

const routesConfig = [
  {
    icon: FaMoneyBill,
    name: "account",
    href: "/account/quotes",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator, authRoles.user],
    subroutes: [
      { name: "Quotes", href: "/account/quotes" },
    ]
  },
  {
    name: "users",
    href: "/users/list",
    roles: [authRoles.super_admin, authRoles.admin], // moderador NO puede gestionar usuarios
    subroutes: [
      { name: "Usuarios", href: "/users/list" },
    ]
  },
  {
    name: "courses",
    href: "/courses-admin/list",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "Cursos", href: "/courses-admin/list" },
    ]
  },
  {
    name: "clients",
    href: "/clients/list",
    roles: [authRoles.super_admin, authRoles.admin, authRoles.moderator],
    subroutes: [
      { name: "Clientes", href: "/clients/list" },
    ]
  },
];

export default routesConfig;


const getRoutesForRole = (roleKey: keyof typeof authRoles) => {
  const role = authRoles[roleKey];
  if (!role) return [];
  return routesConfig.reduce((acc: string[], route) => {
    if (route.roles.includes(role)) {
      acc.push(route.href);
      route.subroutes.forEach(s => acc.push(s.href));
    }
    return acc;
  }, []);
};
export { getRoutesForRole };

const getMainRoutesForRole = (roleKey: keyof typeof authRoles) => {
  const role = authRoles[roleKey] || authRoles.user;
  return routesConfig.filter(route => route.roles.includes(role));
};
export { getMainRoutesForRole };


export const getUserRoles = (profile: UserProfile) => {
  if (!profile.roles) return ["user"];
  if (Array.isArray(profile.roles)) {
    const valid = profile.roles.filter(r => ["super_admin", "admin", "moderator", "user"].includes(r));
    return valid.length > 0 ? valid : ["user"];
  }
  if (["super_admin", "admin", "moderator", "user"].includes(profile.roles)) {
    return [profile.roles];
  }
  return ["user"];
};
