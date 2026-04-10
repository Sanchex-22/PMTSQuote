import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import Images from "../../assets";

const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="min-h-[90dvh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Enlace inválido o expirado.</p>
          <Link to="/forgot-password" className="text-orange-500 hover:underline text-sm">
            Solicitar uno nuevo
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/user/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al restablecer la contraseña.");

      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  };

  // Validación visual de la contraseña
  const strength = [
    { label: "Mínimo 8 caracteres", ok: password.length >= 8 },
    { label: "Letra mayúscula", ok: /[A-Z]/.test(password) },
    { label: "Número", ok: /\d/.test(password) },
  ];

  return (
    <div className="min-h-[90dvh] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-2xl shadow-lg overflow-hidden mb-4 bg-white border border-gray-100 flex items-center justify-center">
            <img src={Images.pmts || Images.logo || "/logo.png"} alt="PMTS" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Nueva contraseña</h1>
          <p className="text-sm text-gray-500 mt-1 text-center">
            Elige una contraseña segura para tu cuenta
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {done ? (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-14 w-14 text-green-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">¡Contraseña actualizada!</h2>
              <p className="text-sm text-gray-500 mb-4">
                Serás redirigido al inicio de sesión en un momento...
              </p>
              <Link to="/login" className="text-sm text-orange-500 hover:text-orange-600 hover:underline">
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nueva contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(null); }}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                  />
                  <button type="button" onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Indicadores de fortaleza */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {strength.map(s => (
                      <div key={s.label} className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span className={`text-xs ${s.ok ? 'text-green-600' : 'text-gray-400'}`}>{s.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setError(null); }}
                    placeholder="••••••••"
                    required
                    className={`w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm text-gray-800 placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition
                      ${confirm && password !== confirm ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirm && password !== confirm && (
                  <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600
                  text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {loading ? "Guardando..." : "Establecer contraseña"}
              </button>

              <div className="text-center">
                <Link to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
