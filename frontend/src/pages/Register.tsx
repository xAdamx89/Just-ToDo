import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";

async function generateKeyPairAndEncrypt(password: string) {
  const enc = new TextEncoder();

  // 1️⃣ Salt do KDF
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 2️⃣ Wyprowadzenie klucza z hasła (PBKDF2)
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 250_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  // 3️⃣ Generacja pary kluczy ECDH (X25519)
  const keyPair: CryptoKeyPair = await crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true, // eksportowalny
    ["deriveKey", "deriveBits"]
  );

  // 4️⃣ Eksport public key
  const publicKey: ArrayBuffer = await crypto.subtle.exportKey("raw", keyPair.publicKey);

  // 5️⃣ Eksport private key i zaszyfrowanie go AES-GCM
  const privateKey: ArrayBuffer = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);


  const iv = crypto.getRandomValues(new Uint8Array(12)); // AES-GCM nonce

  const encryptedPrivateKey: ArrayBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    derivedKey,
    privateKey
  );

  return {
    salt,                   // Uint8Array 16b
    iv,                     // Uint8Array 12b
    publicKey,              // ArrayBuffer
    encryptedPrivateKey,    // ArrayBuffer
  };
}

function Register() {
  const navigate = useNavigate();
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Hasła nie są identyczne!");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1️⃣ Generujemy klucze i szyfrujemy private key
      const { salt, iv, publicKey, encryptedPrivateKey } = await generateKeyPairAndEncrypt(password);

      // 2️⃣ Konwertujemy ArrayBuffer -> Base64 lub hex do wysyłki
      const toBase64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)));

      const payload = {
        username,
        email: email || "",
        password,
        public_key: toBase64(publicKey),
        encrypted_private_key: toBase64(encryptedPrivateKey),
        salt: toBase64(salt),
        iv: toBase64(iv),
      };

      const response = await fetch("https://justtodo.adam-mazurek.pl/api/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || "Nie udało się zarejestrować");

      navigate("/login");
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

          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div>
              <label className="block text-amber-100 text-sm font-medium mb-2">
                Nazwa użytkownika
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" />
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

            {/* Email Input */}
            <div>
              <label className="block text-amber-100 text-sm font-medium mb-2">
                Email (opcjonalny)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-amber-950/50 border border-amber-700/50 rounded-xl text-amber-100 placeholder-amber-400/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  placeholder="twoj@email.com"
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
              disabled={loading}
            >
              {loading ? "Rejestracja..." : "Zarejestruj się"}
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
