// UserProfileContext.tsx
import React, { ReactNode, useContext, useMemo } from 'react';
import { decodeTokenPublic } from '../utils/decode';
import UserContext from './userContext';

export type UserProfile = {
  id: string;
  username?: string;
  email?: string;
  roles?: string;
}

export type DecodedMetaData = UserProfile;

export type UserProfileContextValue = {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const UserProfileContext = React.createContext<UserProfileContextValue | undefined>(undefined);

export type UserProfileProviderProps = { children: ReactNode; }

const roleMap: Record<string, string> = {
  ADMIN: 'admin',
  CLIENT: 'user',
  SALES: 'moderator',
  SUPER_ADMIN: 'super_admin',
  admin: 'admin',
  user: 'user',
  moderator: 'moderator',
  super_admin: 'super_admin',
};

function decodeJwt(rawJwt: string | null): UserProfile | null {
  if (!rawJwt) return null;
  // El JWT se guarda como JSON.stringify({ token: "..." }) o como el token directo
  let tokenStr = rawJwt;
  try {
    const parsed = JSON.parse(rawJwt);
    if (parsed?.token) tokenStr = parsed.token;
  } catch {
    // ya es el token directo
  }

  const decoded = decodeTokenPublic(tokenStr);
  if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) return null;

  const d = decoded as any;
  const rawRole: string = d.roles ?? d.role ?? 'user';
  return {
    id: d.id,
    username: d.username ?? d.name ?? 'n/a',
    email: d.email ?? 'n/a',
    roles: roleMap[rawRole] ?? 'user',
  };
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  // Lee directamente del UserContext (el JWT global) — se actualiza automáticamente tras el login
  const { jwt } = useContext(UserContext) as { jwt: string | null; setJWT: unknown };

  const profile = useMemo(() => decodeJwt(jwt), [jwt]);

  // setProfile es un no-op aquí porque el perfil se deriva del JWT.
  // Lo mantenemos en la interfaz para no romper código existente.
  const setProfile = () => {};

  return (
    <UserProfileContext.Provider value={{ profile, setProfile: setProfile as any }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export default UserProfileContext;
