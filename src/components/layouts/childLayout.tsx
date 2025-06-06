
import Headers from "../meta/headers";
import { UserProfile } from "../../context/userProfileContext";
import Sidebar from "./sidebar";
import AdminNavbar from "./adminNavbar";
import Navbar from "./navbar";
import Footer from "./footer";
import WhatsappButton from "../buttons/whatsapp_button";
// import AdminNavbar from "../ui/adminNavbar";
interface CurrentPathname {
  name: string;
}

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
  title,
  description,
  isLogged,
  profile,
  currentPathname,
  children,
  publicRoute,
}) => {

  return (

    <>
      <Headers title={title} description={description} />
      <main className="w-full relative">
        {publicRoute ? 
        <>
          {/* 
          <Navbar
            currentPathname={currentPathname}
            isLogged={isLogged}
            profile={profile}
          /> 
          */}
        </>
        :
        <AdminNavbar 
        currentPathname={currentPathname}
          isLogged={isLogged}
          profile={profile}/>
        }
        <Sidebar></Sidebar>
        <div className="page-content">{children}</div>
        <WhatsappButton/>
      </main>
      {publicRoute ? <Footer/>:<></>}
    </>
  );
};

export default EnvolveLayout;
