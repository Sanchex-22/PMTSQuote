// UserProfileContext.tsx
import React, { ReactNode, useState, useMemo } from 'react';
import { decodeTokenPublic } from '../utils/decode';
import { authServices } from '../services/authentication';

// Interfaz para los metadatos decodificados
export type DecodedMetaData = {
  id: string;
  username: string;
  email?: string;
  roles?: string;
}

// Perfil de usuario que manejará el contexto
export type UserProfile =  {
  id: string;
  username: string;
  email: string;
  roles?: string;
}

// Valor que maneja el contexto
export type UserProfileContextValue = {
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

// Crear contexto con valor inicial undefined
const UserProfileContext = React.createContext<UserProfileContextValue | undefined>(undefined);

// Props del provider
export type UserProfileProviderProps = {
  children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  // Obtener el JWT desde localStorage (o donde esté guardado)
  const [jwt] = useState<string | null>(() => {
    const currentUser = authServices.getCurrentUser();
    return currentUser ? JSON.stringify(currentUser) : null;
  });

  // Decodificar el token y extraer metadata solo una vez
  const metaData = useMemo<DecodedMetaData | null>(() => {
    const decoded = decodeTokenPublic(jwt);
    return decoded?.metaData ?? null;
  }, [jwt]);

  // Estado del perfil de usuario
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    metaData
      ? {
          id: metaData.id,
          username: metaData.username,
          email: metaData.email ?? '',
          roles: metaData.roles ?? 'user'
        }
      : null
  );

  return (
    <UserProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export default UserProfileContext;
