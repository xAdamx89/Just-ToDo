import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Hasła nie są identyczne!");
      return;
    }
    // Tutaj będzie logika rejestracji
    console.log("Register:", { name, email, password });
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
          whileHover={{ x: -5 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-amber-200 hover:text-amber-100 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Powrót do strony głównej
        </motion.button>

        {/* Register Card */}
        <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-md p-8 rounded-3xl border border-amber-700/30 shadow-2xl">
          <h2 className="text-3xl font-bold text-amber-100 mb-2 text-center">
            Dołącz do nas!
          </h2>
          <p className="text-amber-200/70 text-center mb-8">
            Stwórz swoje konto już teraz
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-amber-100 text-sm font-medium mb-2">
                Imię
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-amber-950/50 border border-amber-700/50 rounded-xl text-amber-100 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="Jan Kowalski"
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-amber-100 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-amber-950/50 border border-amber-700/50 rounded-xl text-amber-100 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="twoj@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-amber-100 text-sm font-medium mb-2">
                Hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-amber-950/50 border border-amber-700/50 rounded-xl text-amber-100 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-amber-100 text-sm font-medium mb-2">
                Potwierdź hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-amber-950/50 border border-amber-700/50 rounded-xl text-amber-100 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Zarejestruj się
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-amber-200/70 text-sm">
              Masz już konto?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-amber-300 hover:text-amber-200 font-semibold underline"
              >
                Zaloguj się
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;
