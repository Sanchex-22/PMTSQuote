import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import LoginPage from "../pages/auth/loginPage";
import Dashboard from "../pages/account/principal";
import ProtectedLogin from "./protectedLogin";
import ProtectedRoute from "./protectedRoutes";
import useUser from "../hook/useUser";
import { CurrentPathname } from "../components/layouts/main";
import EnvolveLayout from "../components/layouts/childLayout";
import { QuotesSection } from "../pages/account/quotes/quotesSection";
import CertificatesSection from "../pages/account/quotes/certificatesSection";
import ServicesSection from "../pages/account/quotes/servicesSection";
import { authRoles } from "../diccionary/constants";
import routesConfig from "./routesConfig";
import useUserProfile from "../hook/userUserProfile";
import Home from "../pages/public_pages/home/home";
import CourseQuote from "../pages/public_pages/home/CourseQuote";
import NotFound from "../pages/public_pages/not_found";
import LicenseQuote from "../pages/public_pages/home/license/licence";
import MedicalCertificateForm from "../pages/public_pages/home/medical-cert/MedicalCert";
import LiberiaForm from "../pages/public_pages/home/liberian/LiberianForm";
import PrivacyPolicy from "../pages/public_pages/PrivacyPolicy/Privacy";
import Evaluation from "../pages/public_pages/home/evaluation/evaluation";
import QuoteDetailPage from "../pages/account/quotes/id/quoteDetail";
import UsersAdmin from "../pages/admin/users/UsersAdmin";
import CoursesAdmin from "../pages/admin/courses/CoursesAdmin";
import ClientsAdmin from "../pages/admin/clients/ClientsAdmin";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";

// Tipado de usuario
export interface User {
  isSignedIn: boolean;
  roles: string[];
  redirectPath: string | null;
}

export interface UserContextValue {
  jwt: string | null;
  setJWT: React.Dispatch<React.SetStateAction<string | null>>;
}

type Props = {
  pathnameLocation: CurrentPathname;
};

export const AppRoutes: React.FC<Props> = ({ pathnameLocation }) => {
  const { pathname } = useLocation();
  const initialPathSet = useRef(false);
  const { isLogged } = useUser();
  const { profile } = useUserProfile();
  useEffect(() => {
    if (!isLogged) {
      if (!initialPathSet.current && pathname !== "/") {
        localStorage.setItem("externalUrl", pathname);
        initialPathSet.current = true;
      }
    }
  }, [isLogged, pathname]);

  const userRole = profile?.roles || "user";
  const user: User = {
    isSignedIn: isLogged,
    roles: [userRole],
    redirectPath: localStorage.getItem("externalUrl"),
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <EnvolveLayout
            title="PmtsQ | Home"
            description="PmtsQ | Home"
            isLogged={isLogged}
            profile={profile}
            currentPathname={pathnameLocation}
            publicRoute={true}
          >
            <Home />
          </EnvolveLayout>
        }
      />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route
        path="/courses"
        element={
          <EnvolveLayout
            title="PmtsQ | Courses"
            description="Courses"
            isLogged={isLogged}
            profile={profile}
            currentPathname={pathnameLocation}
            publicRoute={true}
          >
            <CourseQuote />
          </EnvolveLayout>
        }
      />
      <Route
        path="/licenses"
        element={
          <EnvolveLayout
            title="PmtsQ | Licenses"
            description="Licenses"
            isLogged={isLogged}
            profile={profile}
            currentPathname={pathnameLocation}
            publicRoute={true}
          >
            <LicenseQuote />
          </EnvolveLayout>
        }
      />

      <Route
        path="/evaluation"
        element={
          <EnvolveLayout
            title="PmtsQ | Instructor Evaluation"
            description="Instructor Evaluation"
            isLogged={isLogged}
            profile={profile}
            currentPathname={pathnameLocation}
            publicRoute={true}
          >
            <Evaluation />
          </EnvolveLayout>
        }
      />

      <Route
        path="/medical"
        element={
          <EnvolveLayout
            title="PmtsQ | Medical Certificate"
            description="Medical Certificate"
            isLogged={isLogged}
            profile={profile}
            currentPathname={pathnameLocation}
            publicRoute={true}
          >
            <MedicalCertificateForm />
          </EnvolveLayout>
        }
      />
      <Route
        path="/liberian"
        element={
          <EnvolveLayout
            title="PmtsQ | Liberia Form"
            description="Liberia Form"
            isLogged={isLogged}
            profile={profile}
            currentPathname={pathnameLocation}
            publicRoute={true}
          >
            <LiberiaForm />
          </EnvolveLayout>
        }
      />
      <Route
        path="/privacy"
        element={
          <EnvolveLayout
            title="PmtsQ"
            description="PmtsQ"
            isLogged={isLogged}
            profile={profile}
            currentPathname={pathnameLocation}
            publicRoute={true}
          >
            <PrivacyPolicy />
          </EnvolveLayout>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <EnvolveLayout title="Recuperar contraseña" description="Recuperar contraseña"
            isLogged={isLogged} profile={profile} currentPathname={pathnameLocation} publicRoute={true}>
            <ForgotPasswordPage />
          </EnvolveLayout>
        }
      />
      <Route
        path="/reset-password"
        element={
          <EnvolveLayout title="Nueva contraseña" description="Nueva contraseña"
            isLogged={isLogged} profile={profile} currentPathname={pathnameLocation} publicRoute={true}>
            <ResetPasswordPage />
          </EnvolveLayout>
        }
      />
      <Route
        path="/login"
        element={
          <ProtectedLogin auth={user}>
            <EnvolveLayout
              title="Login"
              description="Login"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={true}
            >
              <LoginPage />
            </EnvolveLayout>
          </ProtectedLogin>
        }
      />
      <Route
        path="/account/*"
        element={
          <ProtectedRoute
            isLogged={isLogged}
            auth={user}
            allowedRoles={[
              authRoles.user,
              authRoles.admin,
              authRoles.moderator,
              authRoles.super_admin,
            ]}
          >
            <EnvolveLayout
              title="account"
              description="account"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
            >
              <Dashboard
                subroutes={
                  routesConfig.find((route) => route.name === "account")
                    ?.subroutes || []
                }
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="quotes" 
        element={
          <QuotesSection />
        } 
        />
        <Route path="quotes/:id" 
        element={
          <QuoteDetailPage />
        } 
        />
        <Route path="certificates" element={<CertificatesSection />} />
        <Route path="services" element={<ServicesSection />} />
      </Route>

      <Route
        path="/users/*"
        element={
          <ProtectedRoute
            isLogged={isLogged}
            auth={user}
            allowedRoles={[authRoles.admin, authRoles.super_admin]}
          >
            <EnvolveLayout
              title="Usuarios"
              description="Gestión de usuarios"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
            >
              <Dashboard
                subroutes={routesConfig.find((r) => r.name === "users")?.subroutes || []}
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="list" element={<UsersAdmin />} />
      </Route>

      <Route
        path="/courses-admin/*"
        element={
          <ProtectedRoute
            isLogged={isLogged}
            auth={user}
            allowedRoles={[authRoles.admin, authRoles.moderator, authRoles.super_admin]}
          >
            <EnvolveLayout
              title="Cursos"
              description="Gestión de cursos"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
            >
              <Dashboard
                subroutes={routesConfig.find((r) => r.name === "courses")?.subroutes || []}
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="list" element={<CoursesAdmin />} />
      </Route>

      <Route
        path="/clients/*"
        element={
          <ProtectedRoute
            isLogged={isLogged}
            auth={user}
            allowedRoles={[authRoles.admin, authRoles.moderator, authRoles.super_admin]}
          >
            <EnvolveLayout
              title="Clientes"
              description="Gestión de clientes"
              isLogged={isLogged}
              profile={profile}
              currentPathname={pathnameLocation}
              publicRoute={false}
            >
              <Dashboard
                subroutes={routesConfig.find((r) => r.name === "clients")?.subroutes || []}
              />
            </EnvolveLayout>
          </ProtectedRoute>
        }
      >
        <Route path="list" element={<ClientsAdmin />} />
      </Route>

      <Route
        path="*"
        element={
          <EnvolveLayout
            title="No Found"
            description="No Found"
            isLogged={isLogged}
            profile={profile}
            currentPathname={pathnameLocation}
            publicRoute={true}
          >
            <NotFound />
          </EnvolveLayout>
        }
      />
    </Routes>
  );
};
