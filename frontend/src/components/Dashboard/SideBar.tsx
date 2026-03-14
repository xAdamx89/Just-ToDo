import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2, Sun, Moon, LogOut } from "lucide-react";
import { cn } from "../../utils/cn";

// Definiujemy co Sidebar musi "dostać" z zewnątrz
interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  user: any; // Możesz tu użyć swojego typu User | null
  activeView: string;
  setActiveView: (view: string) => void;
  navItems: any[];
  handleLogout: () => void;
  toggleTheme: () => void;
  theme: string;
  t: any; // klasy motywu
}

export function Sidebar({ 
  sidebarOpen, setSidebarOpen, user, activeView, 
  setActiveView, navItems, handleLogout, toggleTheme, theme, t 
}: SidebarProps) {
  const d = theme === "dark";

  return (
    <motion.aside 
      initial={false} 
      animate={{ width: sidebarOpen ? 280 : 80 }} 
      className={cn("backdrop-blur-xl border-r flex flex-col relative z-20", t.sidebarBg)}
    >
      {/* toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="absolute -right-3 top-6 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg z-10 hover:scale-110 transition-transform"
      >
        <ChevronRight className={cn("w-4 h-4 text-white transition-transform", !sidebarOpen && "rotate-180")} />
      </button>

      {/* logo */}
      <div className={cn("p-6 border-b", t.divider)}>
        <motion.div animate={{ justifyContent: sidebarOpen ? "flex-start" : "center" }} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden">
                <h1 className={cn("text-xl font-bold whitespace-nowrap", t.textPrimary)}>Just ToDo</h1>
                <p className={cn("text-xs whitespace-nowrap", t.textSecondary)}>Twój inteligentny organizer</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      
        {/* user info */}
        <div className={cn("p-4 border-b", t.divider)}>
        <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0", t.avatarBg)}>
            <span className={cn("font-semibold text-sm", t.avatarText)}>JD</span>
            </div>
            <AnimatePresence>
            {sidebarOpen && (
                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="overflow-hidden flex-1">
                <p className={cn("text-sm font-medium truncate", t.textPrimary)}>{user?.username ?? "Brak nazwy użytkownika"}</p>
                <p className={cn("text-xs truncate", t.textSecondary)}>{user?.email || "Brak email w bazie danych"}</p>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
        </div>

        {/* theme toggle */}
        <div className={cn("p-4 border-b", t.divider)}>
        <motion.button onClick={toggleTheme} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={cn("w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl transition-all", d ? "bg-amber-800/20 text-amber-300/80 hover:bg-amber-800/30" : "bg-amber-100/60 text-amber-700 hover:bg-amber-200/60")}>
            {d ? <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" /> : <Moon className="w-4 h-4 text-amber-600 flex-shrink-0" />}
            <AnimatePresence>
            {sidebarOpen && (
                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="text-sm font-medium whitespace-nowrap overflow-hidden">
                {d ? "Tryb jasny" : "Tryb ciemny"}
                </motion.span>
            )}
            </AnimatePresence>
        </motion.button>
        </div>

        {/* navigation */}
        <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
            <motion.button key={item.id} onClick={() => setActiveView(item.id)} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all", activeView === item.id ? t.navActive : t.navInactive)}>
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
                {sidebarOpen && (
                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="text-sm font-medium whitespace-nowrap overflow-hidden">
                    {item.label}
                </motion.span>
                )}
            </AnimatePresence>
            </motion.button>
        ))}
        </nav>

        {/* logout */}
        <div className={cn("p-4 border-t", t.divider)}>
        <motion.button whileHover={{ x: 4 }} onClick={handleLogout} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all", t.navInactive)}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
            {sidebarOpen && (
                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className="text-sm font-medium whitespace-nowrap overflow-hidden">
                Wyloguj się
                </motion.span>
            )}
            </AnimatePresence>
        </motion.button>
        </div>
    </motion.aside>
  );
}