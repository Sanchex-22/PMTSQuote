import ReactDOM from "react-dom/client";
import "./index.css";
import { UserContextProvider } from "./context/userContext.tsx";
import App from "./app.tsx";
import { UserProfileProvider } from "./context/userProfileContext.tsx";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <UserContextProvider>
    <UserProfileProvider>
    <App />
    </UserProfileProvider>
  </UserContextProvider>
);
