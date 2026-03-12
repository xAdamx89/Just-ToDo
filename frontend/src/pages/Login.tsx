import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, User } from "lucide-react";


function Login() {
  const navigate = useNavigate();

  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Nieprawidłowe dane logowania");

      // ───────── Zapis JWT ─────────
      localStorage.setItem("access_token", data.access.token);
      localStorage.setItem("access_token_expires_at", data.access.expires_in.toString());

      localStorage.setItem("refresh_token", data.refresh.token);
      localStorage.setItem("refresh_token_expires_at", data.refresh.expires_in.toString());

      localStorage.setItem("auth_issued_at", data.issue_at.toString());
      // ───────── Przekierowanie ─────────
      navigate("/productivedashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-red-950 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <motion.button
          type="button"
          whileHover={{ x: -5 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-amber-200 hover:text-amber-100 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Powrót do strony głównej
        </motion.button>

        {/* Login Card */}
        <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-md p-8 rounded-3xl border border-amber-700/30 shadow-2xl">
          <h2 className="text-3xl font-bold text-amber-100 mb-2 text-center">
            Witaj ponownie!
          </h2>
          <p className="text-amber-200/70 text-center mb-8">
            Zaloguj się do swojego konta
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-amber-100 text-sm font-medium mb-2">
                Nazwa użytkownika
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-amber-950/50 border border-amber-700/50 rounded-xl text-amber-100 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="eruddy22"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-amber-100 text-sm font-medium mb-2">
                Hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-amber-950/50 border border-amber-700/50 rounded-xl text-amber-100 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logowanie..." : "Zaloguj się"}
            </motion.button>
          </form>

          {/* Register */}
          <div className="mt-6 text-center">
            <p className="text-amber-200/70 text-sm">
              Nie masz konta?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-amber-300 hover:text-amber-200 font-semibold underline"
              >
                Zarejestruj się
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
