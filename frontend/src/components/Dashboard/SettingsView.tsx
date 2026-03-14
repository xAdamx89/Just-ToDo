import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface SettingsViewProps {
  user: any;
  t: any;
}

export function SettingsView({ user, t }: SettingsViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-2xl"
    >
      {/* Profil */}
      <div className={cn("p-6 rounded-2xl border", t.cardBg)}>
        <h3 className={cn("text-lg font-semibold mb-4", t.textPrimary)}>
          Ustawienia profilu
        </h3>
        <div className="space-y-4">
          {[
            { label: "Nazwa użytkownika", value: user?.username ?? "Brak nazwy użytkownika", type: "text" },
            { label: "Email", value: user?.email ?? "Brak email w bazie danych", type: "email" },
            { label: "Imię", value: "", type: "text" },
            { label: "Nazwisko", value: "", type: "text" },
          ].map((field) => (
            <div key={field.label}>
              <label className={cn("block text-sm mb-2", t.textSecondary)}>{field.label}</label>
              <input
                type={field.type}
                defaultValue={field.value}
                className={cn(
                  "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all",
                  t.inputBg
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Powiadomienia */}
      <div className={cn("p-6 rounded-2xl border", t.cardBg)}>
        <h3 className={cn("text-lg font-semibold mb-4", t.textPrimary)}>Powiadomienia</h3>
        <div className="space-y-4">
          {["Powiadomienia email", "Przypomnienia o zadaniach"].map((label) => (
            <label key={label} className="flex items-center justify-between cursor-pointer">
              <span className={t.textPrimary}>{label}</span>
              <div className="relative">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div
                  className={cn(
                    "w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all",
                    t.toggleTrack,
                    t.toggleChecked
                  )}
                />
              </div>
            </label>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn("w-full py-3 rounded-xl font-medium transition-all", t.btnPrimary)}
      >
        Zapisz zmiany
      </motion.button>
    </motion.div>
  );
}