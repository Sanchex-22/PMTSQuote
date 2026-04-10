import Headers from "../meta/headers";
import { UserProfile } from "../../context/userProfileContext";
import AdminNavbar from "./adminNavbar";
import Footer from "./footer";
import Navbar from "./navbar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Toaster } from "sonner";
import { GlobalSearch } from "../admin/GlobalSearch";

interface CurrentPathname { name: string; }

interface childLayoutProps {
  title: string;
  description: string;
  isLogged: boolean;
  profile: UserProfile | null;
  currentPathname: CurrentPathname;
  children: React.ReactNode;
  publicRoute: boolean;
}

const EnvolveLayout: React.FC<childLayoutProps> = ({
  title, description, isLogged, profile, currentPathname, children, publicRoute,
}) => {
  return (
    <>
      <Headers title={title} description={description} />
      {publicRoute ? (
        <main className="w-full relative min-h-screen bg-slate-50 overflow-x-hidden">
          <Navbar profile={profile} currentPathname={currentPathname} isLogged={isLogged} />
          <div id="page-content" className="z-10">
            {children}
            <Toaster richColors position="top-right" />
            <Analytics />
            <SpeedInsights />
          </div>
          <Footer />
        </main>
      ) : (
        <div className="flex min-h-screen bg-gray-50">
          <AdminNavbar currentPathname={currentPathname} isLogged={isLogged} profile={profile} />
          {/* Offset sidebar desktop / top bar mobile */}
          <div className="flex-1 md:ml-56 pt-14 md:pt-0 min-w-0">
            {/* Admin top bar with global search */}
            <div className="sticky top-14 md:top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-6 h-14 flex items-center">
              <GlobalSearch />
            </div>
            <div id="page-content" className="z-10 min-h-screen">
              {children}
              <Toaster richColors position="top-right" />
              <Analytics />
              <SpeedInsights />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EnvolveLayout;
