import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ArrowLeft, User } from "lucide-react";

async function deriveKeyFromPassword(password: string, salt: Uint8Array, iterations: number) {
  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer, // 👈 jawne zawężenie
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  )
;}

async function decryptPrivateKey(
  encryptedPrivateKey: Uint8Array,
  derivedKey: CryptoKey,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: toArrayBuffer(iv),
    },
    derivedKey,
    toArrayBuffer(encryptedPrivateKey)
  );
}

function toArrayBuffer(view: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(view.byteLength);
  new Uint8Array(buffer).set(view);
  return buffer;
}

function Login() {
  const navigate = useNavigate();

  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("https://justtodo.adam-mazurek.pl/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Nieprawidłowe dane logowania");

      const { kdf_salt, kdf_iterations, public_key, encrypted_private_key, iv } = data.encryption;

      // ───────── Funkcja konwertująca Base64 -> Uint8Array ─────────
      const base64ToUint8 = (b64: string | null): Uint8Array | null => {
        if (!b64) return null;
        return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      };

      const salt = base64ToUint8(kdf_salt);
      const ciphertext = base64ToUint8(encrypted_private_key);
      const nonce = base64ToUint8(iv);

      let privateKeyBuffer: ArrayBuffer | null = null;

      // ───────── Jeśli mamy zaszyfrowany private key ─────────
      if (ciphertext && salt && nonce) {
        const derivedKey = await deriveKeyFromPassword(password, salt, kdf_iterations);
        privateKeyBuffer = await decryptPrivateKey(ciphertext, derivedKey, nonce);
      }

      // 🔐 Trzymamy privateKeyBuffer w React Context lub w pamięci
      // ⚠️ NIE zapisujemy go w localStorage

      // ───────── Zapis JWT ─────────
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

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