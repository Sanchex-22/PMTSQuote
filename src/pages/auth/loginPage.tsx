import { useState } from "react";
import LoginForm from "../../components/forms/loginForm";
import { Link } from "react-router-dom";

function LoginPage() {
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-full max-w-md p-8 space-y-4 bg-neutral-100 shadow-lg rounded-xl backdrop-blur-md bg-opacity-90">
        <h1 className="text-3xl font-extrabold text-center text-black">
          Iniciar Sesión
        </h1>
        <p className="text-gray-500 text-center">Accede con tus credenciales</p>
        <LoginForm
          pending={pending}
          setPending={setPending}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          error={error}
          setError={setError}
        />
        <div className="text-center mt-4">
          <Link
            to="/forgot-password"
            className="text-sm text-orange-400 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
