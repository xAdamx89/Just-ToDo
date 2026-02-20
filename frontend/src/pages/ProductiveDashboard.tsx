import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ListTodo,
  Layers,
  Users,
  Settings,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Star,
  Calendar,
  ArrowRight,
  Search,
  ChevronRight,
  UserPlus,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useMemo } from "react";

// ── Types ──────────────────────────────────────────────
type Theme = "dark" | "light";

interface User {
  id: number;
  username: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  is_important: boolean;
  deadline: string | null;
  created_at: string;
}

type TaskFilter = "all" | "pending" | "completed" | "important" | "critical";

interface FifoItem {
  id: number;
  title: string;
  created_at: string;
}

interface SharedUser {
  id: number;
  username: string;
  email: string;
  shared_lists: string[];
}

// // ── Sample data ────────────────────────────────────────
// const sampleTasks: Task[] = [
//   { id: 1, title: "Przygotować prezentację", description: "PowerPoint dla klienta", priority: "high", status: "in_progress", is_important: true, deadline: "2024-02-20", created_at: "2024-02-15" },
//   { id: 2, title: "Napisać raport miesięczny", description: "", priority: "medium", status: "pending", is_important: false, deadline: "2024-02-25", created_at: "2024-02-16" },
//   { id: 3, title: "Zadzwonić do kontrahenta", description: "Omówić warunki umowy", priority: "high", status: "pending", is_important: true, deadline: "2024-02-18", created_at: "2024-02-17" },
//   { id: 4, title: "Zaktualizować dokumentację", description: "", priority: "low", status: "completed", is_important: false, deadline: null, created_at: "2024-02-10" },
//   { id: 5, title: "Spotkanie zespołu", description: "Cotygodniowy stand-up", priority: "medium", status: "pending", is_important: false, deadline: "2024-02-19", created_at: "2024-02-17" },
// ];

const sampleFifoItems: FifoItem[] = [
  { id: 1, title: "Naprawić bug w logowaniu", created_at: "2024-02-15" },
  { id: 2, title: "Zrobić backup bazy danych", created_at: "2024-02-14" },
  { id: 3, title: "Przeczytać artykuł o React 19", created_at: "2024-02-13" },
];

const sampleSharedUsers: SharedUser[] = [
  { id: 2, username: "jan_kowalski", email: "jan@example.com", shared_lists: ["Moje Zadania", "LIFO"] },
  { id: 3, username: "anna_nowak", email: "anna@example.com", shared_lists: ["Moje Zadania"] },
];

// ── Nav items ──────────────────────────────────────────
const navItems = [
  { id: "tasks", label: "Moje Zadania", icon: ListTodo },
  { id: "fifo", label: "Kolejka zadań FIFO", icon: Layers },
  { id: "sharing", label: "Współdzielenie", icon: Users },
  { id: "settings", label: "Ustawienia", icon: Settings },
];

// ── Priority / Status badges ───────────────────────────
const priorityConfig = {
  low:      { label: "Niski",     dark: "bg-slate-500/20 text-slate-300 border-slate-500/30",    light: "bg-slate-200 text-slate-600 border-slate-300" },
  medium:   { label: "Średni",    dark: "bg-blue-500/20 text-blue-300 border-blue-500/30",       light: "bg-blue-100 text-blue-700 border-blue-300" },
  high:     { label: "Wysoki",    dark: "bg-orange-500/20 text-orange-300 border-orange-500/30", light: "bg-orange-100 text-orange-700 border-orange-300" },
  critical: { label: "Krytyczny", dark: "bg-red-500/20 text-red-300 border-red-500/30",          light: "bg-red-100 text-red-700 border-red-300" },
};

const statusConfig = {
  pending:     { label: "Oczekujące",  dark: "bg-slate-500/20 text-slate-300",  light: "bg-slate-200 text-slate-600" },
  in_progress: { label: "W trakcie",   dark: "bg-amber-500/20 text-amber-300",  light: "bg-amber-100 text-amber-700" },
  completed:   { label: "Ukończone",   dark: "bg-emerald-500/20 text-emerald-300", light: "bg-emerald-100 text-emerald-700" },
  cancelled:   { label: "Anulowane",   dark: "bg-red-500/20 text-red-300",      light: "bg-red-100 text-red-700" },
};

// ── Helper: build a theme-aware class map ──────────────
function useThemeClasses(theme: Theme) {
  const d = theme === "dark";
  return {
    // backgrounds
    mainBg: d
      ? "bg-gradient-to-br from-amber-950 via-orange-950 to-red-950"
      : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
    sidebarBg: d
      ? "bg-amber-950/60 border-amber-800/40"
      : "bg-white/70 border-amber-200/60",
    cardBg: d
      ? "bg-amber-900/25 border-amber-800/30 backdrop-blur-sm"
      : "bg-white/60 border-amber-200/50 backdrop-blur-sm shadow-sm",
    cardBgAlt: d
      ? "bg-amber-950/30 border-amber-800/20"
      : "bg-amber-50/60 border-amber-200/40",
    inputBg: d
      ? "bg-amber-950/40 border-amber-800/40 text-amber-50 placeholder-amber-400/40"
      : "bg-white/80 border-amber-200/60 text-slate-800 placeholder-slate-400",
    // text
    textPrimary: d ? "text-amber-50" : "text-slate-800",
    textSecondary: d ? "text-amber-300/70" : "text-slate-600",
    textMuted: d ? "text-amber-400/50" : "text-slate-400",
    // nav
    navActive: d
      ? "bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-amber-300 border border-amber-600/30"
      : "bg-gradient-to-r from-amber-200/60 to-orange-200/60 text-amber-800 border border-amber-300/60",
    navInactive: d
      ? "text-amber-400/60 hover:bg-amber-800/20 hover:text-amber-200"
      : "text-slate-500 hover:bg-amber-100/60 hover:text-slate-800",
    // buttons
    btnPrimary:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-600/25 hover:shadow-orange-500/40",
    btnSecondary: d
      ? "bg-amber-800/30 text-amber-200 hover:bg-amber-800/50"
      : "bg-amber-100 text-slate-700 hover:bg-amber-200",
    btnDanger:
      "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-600/25",
    // filters
    filterActive: d
      ? "bg-amber-600/20 text-amber-300 border border-amber-600/30"
      : "bg-amber-200/60 text-amber-800 border border-amber-300/60",
    filterInactive: d
      ? "bg-amber-900/20 text-amber-400/60 border border-amber-800/30 hover:bg-amber-800/20"
      : "bg-white/50 text-slate-500 border border-amber-200/50 hover:bg-amber-50",
    // avatar
    avatarBg: d
      ? "bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-600/30"
      : "bg-gradient-to-br from-amber-300/40 to-orange-300/40 border-amber-400/50",
    avatarText: d ? "text-amber-300" : "text-amber-800",
    // task states
    taskImportantRing: d ? "ring-1 ring-amber-500/40" : "ring-1 ring-amber-400/60",
    taskCompleted: d ? "opacity-50" : "opacity-45",
    taskCompletedText: d ? "text-amber-500/50 line-through" : "text-slate-400 line-through",
    // checkbox
    checkboxIdle: d
      ? "border-amber-700/60 hover:border-amber-400"
      : "border-amber-300 hover:border-amber-500",
    // lifo
    lifoHighlight: d
      ? "bg-gradient-to-br from-amber-800/30 to-orange-800/30 border-amber-600/30 backdrop-blur-sm"
      : "bg-gradient-to-br from-amber-100/80 to-orange-100/80 border-amber-300/50 backdrop-blur-sm shadow-sm",
    lifoActive: d
      ? "bg-amber-700/15 border-amber-600/30"
      : "bg-amber-100/80 border-amber-300/50",
    lifoActiveText: d ? "text-amber-300" : "text-amber-800",
    lifoNumberActive: "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md",
    lifoNumberIdle: d
      ? "bg-amber-900/40 text-amber-400/60"
      : "bg-amber-200/80 text-amber-700",
    // stats
    statAll: d ? "text-amber-50" : "text-slate-800",
    statPending: d ? "text-amber-300" : "text-amber-600",
    statDone: d ? "text-emerald-400" : "text-emerald-600",
    statImportant: d ? "text-red-400" : "text-red-600",
    // tags
    tagBg: d ? "bg-amber-800/30 text-amber-200/80" : "bg-amber-100/80 text-amber-800",
    // modal
    modalOverlay: "bg-black/60 backdrop-blur-sm",
    modalBg: d
      ? "bg-amber-950 border-amber-800/40"
      : "bg-white border-amber-200/60",
    // dividers
    divider: d ? "border-amber-800/40" : "border-amber-200/50",
    // toggle track
    toggleTrack: d ? "bg-amber-900/50" : "bg-amber-200",
    toggleChecked: "peer-checked:bg-amber-500",
    // hover on card
    cardHover: d ? "hover:border-amber-700/50" : "hover:border-amber-300/60",
  };
}

function getToken() {
  return localStorage.getItem("access_token") || "";
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return false;

  const res = await fetch("/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return false;

  const data = await res.json();
  localStorage.setItem("access_token", data.access);
  return true;
}

// function getAuthHeader() {
//   const token = localStorage.getItem("access_token");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// }

// export async function fetchEncryptedObjects(
//   objectType: "tasks" | "fifo" | "settings"
// ) {
//   const authHeader = getAuthHeader();
//   const response = await fetch(
//     `${API_BASE}/objects/?type=${objectType}`,
//     {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         ...getAuthHeader()
//       },
//     }
//   );

//   if (!response.ok) {
//     const text = await response.text();
//     throw new Error(`Fetch error: ${response.status} ${text}`);
//   }

//   return await response.json(); // zwraca tablicę
// }

// ── Component ──────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("tasks");
  // const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [fifoItems, setFifoItems] = useState<FifoItem[]>(sampleFifoItems);
  const [sharedUsers] = useState<SharedUser[]>(sampleSharedUsers);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [taskSearch, setTaskSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const API_URL = "https://justtodo.adam-mazurek.pl";

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    // Przekierowanie na stronę główną
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch(`${API_URL}/api/api/me/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Błąd pobierania usera:", err));
  }, []);



    // =========================
  // ADD TASK
  // =========================
  const addTask = async (taskData: Omit<Task, "id" | "created_at">) => {
    try {
      let res = await fetch(`${API_URL}/api/api/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) throw new Error("Błąd dodawania taska");

      await fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // UPDATE TASK
  // =========================
  const updateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const res = await fetch(`${API_URL}/api/api/tasks/?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Błąd aktualizacji taska");

      await fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/api/api/tasks/?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!res.ok) throw new Error("Błąd usuwania taska");

      await fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // FETCH TASKS
  // =========================
  const fetchTasks = async (filter: TaskFilter = taskFilter) => {
    setLoading(true);
    let url = `${API_URL}/api/api/tasks/`;

    if (filter === "pending") url += "?status=pending";
    if (filter === "completed") url += "?status=completed";
    if (filter === "important") url += "?important=true";
    if (filter === "critical") url += "?priority=critical";

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Błąd pobierania tasków");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    // =========================
  // TOGGLE COMPLETE
  // =========================
  const toggleComplete = async (task: Task) => {
    const newStatus =
      task.status === "completed" ? "pending" : "completed";

    await updateTask(task.id, { status: newStatus });
  };

  // =========================
  // TOGGLE IMPORTANT
  // =========================
  const toggleImportant = async (task: Task) => {
    await updateTask(task.id, {
      is_important: !task.is_important,
    });
  };

    // =========================
  // FILTER + SEARCH (frontend)
  // =========================
const filteredTasks = useMemo(() => {
  let result = tasks;

  // SEARCH
  if (taskSearch.trim() !== "") {
    const query = taskSearch.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
    );
  }

  // FILTER
  if (taskFilter !== "all") {
    result = result.filter((t) => {
      switch (taskFilter) {
        case "pending":
          return t.status === "pending";
        case "completed":
          return t.status === "completed";
        case "important":
          return t.is_important;
        case "critical":
          return t.priority === "critical"; // <-- upewnij się, że masz takie pole w taskach
        default:
          return true;
      }
    });
  }

  return result;
}, [tasks, taskSearch, taskFilter]);

  // =========================
  // STATS (liczone w React)
  // =========================
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      completed: tasks.filter((t) => t.status === "completed").length,
      important: tasks.filter((t) => t.priority === "critical").length,
    };
  }, [tasks]);

    // AUTO LOAD
  // =========================
  useEffect(() => {
    if (getToken()) fetchTasks();
  }, [getToken()]);

  useEffect(() => {
    fetchTasks(taskFilter);
  }, [taskFilter]);

  // Theme
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("justtodo-theme");
    return (saved as Theme) || "dark";
  });
  useEffect(() => { localStorage.setItem("justtodo-theme", theme); }, [theme]);

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));
  const t = useThemeClasses(theme);
  const d = theme === "dark";


  // ── FIFO handlers (First In First Out) ─────────────────
  const addFifoItem = () => {
    if (!newFifo.trim()) return;
    const item: FifoItem = { id: Date.now(), title: newFifo, created_at: new Date().toISOString().split("T")[0] };
    setFifoItems((prev) => [...prev, item]); // enqueue at end
    setNewFifo("");
  };
  const dequeueFifoItem = () => setFifoItems((prev) => prev.slice(1)); // dequeue from front
  const deleteFifoItem = (id: number) => setFifoItems((prev) => prev.filter((i) => i.id !== id));


  // FIFO form
  const [newFifo, setNewFifo] = useState("");

  // Task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [newDeadline, setNewDeadline] = useState("");

  // ── Task handlers ─────────────────────────────────────
  const resetForm = () => { setNewTitle(""); setNewDesc(""); setNewPriority("medium"); setNewDeadline(""); setEditingTask(null); setShowTaskForm(false); };

  // ── Render ────────────────────────────────────────────
  return (
    <div className={cn("min-h-screen flex", t.mainBg)}>
      {/* ─── Animated BG orbs (same as Home) ─── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className={cn("absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl", d ? "bg-orange-500/8" : "bg-amber-300/20")} />
        <motion.div animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className={cn("absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl", d ? "bg-amber-500/8" : "bg-orange-200/20")} />
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl", d ? "bg-red-900/5" : "bg-yellow-200/15")} />
      </div>

      {/* ─── Sidebar ─── */}
      <motion.aside initial={false} animate={{ width: sidebarOpen ? 280 : 80 }} className={cn("backdrop-blur-xl border-r flex flex-col relative z-20", t.sidebarBg)}>
        {/* toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute -right-3 top-6 w-6 h-6 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg z-10 hover:scale-110 transition-transform">
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

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-auto relative z-10">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className={cn("text-3xl font-bold mb-1", t.textPrimary)}>
              {navItems.find((n) => n.id === activeView)?.label}
            </h1>
            <p className={t.textSecondary}>
              {activeView === "tasks" && "Zarządzaj swoimi zadaniami"}
              {activeView === "fifo" && "Metoda FIFO — Pierwszy dodany, pierwszy do wykonania"}
              {activeView === "sharing" && "Współdziel swoje listy z innymi"}
              {activeView === "settings" && "Dostosuj aplikację do swoich potrzeb"}
            </p>
          </motion.div>

          {/* ═══════ TASKS VIEW ═══════ */}
          {activeView === "tasks" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Wszystkie", value: stats.total, color: t.statAll, filter: "all" as TaskFilter },
                  { label: "Do zrobienia", value: stats.pending, color: t.statPending, filter: "pending" as TaskFilter },
                  { label: "Ukończone", value: stats.completed, color: t.statDone, filter: "completed" as TaskFilter },
                  { label: "Krytyczne", value: stats.important, color: t.statImportant, filter: "critical" as TaskFilter },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={cn("p-4 rounded-2xl border cursor-pointer", t.cardBg, taskFilter === s.filter ? "ring-2 ring-amber-500" : "")}
                    onClick={() => setTaskFilter(s.filter)}
                  >
                    <p className={cn("text-sm mb-1", t.textSecondary)}>{s.label}</p>
                    <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                  </div>
                ))}
                </div>

              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-2 flex-wrap">
                  {(["all", "pending", "completed", "critical"] as const).map((f) => (
                    <button key={f} onClick={() => setTaskFilter(f)} className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", taskFilter === f ? t.filterActive : t.filterInactive)}>
                      {f === "all" && "Wszystkie"}
                      {f === "pending" && "Do zrobienia"}
                      {f === "completed" && "Ukończone"}
                      {f === "critical" && "Krytyczne"}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", t.textSecondary)} />
                    <input type="text" placeholder="Szukaj zadań..." value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)} className={cn("w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all", t.inputBg)} />
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { resetForm(); setShowTaskForm(true); }} className={cn("px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all", t.btnPrimary)}>
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">Dodaj</span>
                  </motion.button>
                </div>
              </div>

              {/* Task list */}
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task, i) => (
                    <motion.div key={task.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ delay: i * 0.04 }} className={cn("p-4 rounded-2xl border group transition-all", t.cardBg, t.cardHover, task.is_important && t.taskImportantRing, task.status === "completed" && t.taskCompleted)}>
                      <div className="flex items-start gap-4">
                        {/* checkbox */}
                        <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => toggleComplete(task)} className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all", task.status === "completed" ? "bg-emerald-500 border-emerald-500" : t.checkboxIdle)}>
                          {task.status === "completed" && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </motion.button>

                        {/* content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={cn("font-medium truncate", task.status === "completed" ? t.taskCompletedText : t.textPrimary)}>{task.title}</h3>
                            {task.is_important && <Star className={cn("w-4 h-4 fill-amber-400 flex-shrink-0", d ? "text-amber-400" : "text-amber-500")} />}
                          </div>
                          {task.description && <p className={cn("text-sm mb-2 truncate", t.textSecondary)}>{task.description}</p>}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", d ? priorityConfig[task.priority].dark : priorityConfig[task.priority].light)}>{priorityConfig[task.priority].label}</span>
                            <span className={cn("px-2 py-0.5 rounded text-xs font-medium", d ? statusConfig[task.status].dark : statusConfig[task.status].light)}>{statusConfig[task.status].label}</span>
                            {task.deadline && (
                              <span className={cn("flex items-center gap-1 text-xs", t.textMuted)}>
                                <Calendar className="w-3 h-3" />
                                {new Date(task.deadline).toLocaleDateString("pl-PL")}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleImportant(task)} className={cn("p-2 transition-colors", t.textSecondary, "hover:text-amber-400")}>
                            <Star className={cn("w-4 h-4", task.is_important && "fill-amber-400 text-amber-400")} />
                          </button>
                          <button onClick={() => { setEditingTask(task); setNewTitle(task.title); setNewDesc(task.description); setNewPriority(task.priority); setNewDeadline(task.deadline || ""); setShowTaskForm(true); }} className={cn("p-2 transition-colors", t.textSecondary, "hover:text-blue-400")}>
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteTask(task.id)} className={cn("p-2 transition-colors", t.textSecondary, "hover:text-red-400")}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredTasks.length === 0 && (
                  <div className="text-center py-16">
                    <ListTodo className={cn("w-14 h-14 mx-auto mb-4", t.textMuted)} />
                    <p className={t.textSecondary}>Brak zadań do wyświetlenia</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══════ FIFO VIEW ═══════ */}
          {activeView === "fifo" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* add */}
                <div className={cn("p-6 rounded-2xl border", t.cardBg)}>
                  <h3 className={cn("text-lg font-semibold mb-1", t.textPrimary)}>Dodaj do kolejki</h3>
                  <p className={cn("text-sm mb-4", t.textSecondary)}>Nowe zadanie trafia na koniec kolejki</p>
                  <div className="flex gap-3">
                    <input type="text" value={newFifo} onChange={(e) => setNewFifo(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFifoItem()} placeholder="Co musisz zrobić?" className={cn("flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all", t.inputBg)} />
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addFifoItem} className={cn("px-6 py-3 rounded-xl font-medium", t.btnPrimary)}>
                      <Plus className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                {/* next (front of queue) */}
                <div className={cn("p-6 rounded-2xl border", t.lifoHighlight)}>
                  <h3 className={cn("text-lg font-semibold mb-1", t.textPrimary)}>Do wykonania teraz</h3>
                  <p className={cn("text-sm mb-4", t.textSecondary)}>Najstarsze zadanie (przód kolejki)</p>
                  {fifoItems.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
                        <ArrowRight className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-lg font-semibold truncate", t.textPrimary)}>{fifoItems[0].title}</p>
                        <p className={cn("text-sm", t.textSecondary)}>Dodano: {new Date(fifoItems[0].created_at).toLocaleDateString("pl-PL")}</p>
                      </div>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={dequeueFifoItem} className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 flex items-center gap-2 flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="hidden sm:inline">Wykonaj</span>
                      </motion.button>
                    </div>
                  ) : (
                    <p className={cn("text-center py-4", t.textSecondary)}>Kolejka jest pusta</p>
                  )}
                </div>
              </div>

              {/* queue list */}
              <div className={cn("p-6 rounded-2xl border", t.cardBg)}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={cn("text-lg font-semibold", t.textPrimary)}>Kolejka FIFO ({fifoItems.length} {fifoItems.length === 1 ? "zadanie" : "zadań"})</h3>
                  <span className={cn("text-sm", t.textSecondary)}>Pierwszy dodany → pierwszy do wykonania</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {fifoItems.map((item: FifoItem, index: number) => (
                      <motion.div key={item.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all", index === 0 ? t.lifoActive : t.cardBgAlt)}>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0", index === 0 ? t.lifoNumberActive : t.lifoNumberIdle)}>
                          {index === 0 ? "▶" : index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("font-medium truncate", index === 0 ? t.lifoActiveText : t.textPrimary)}>{item.title}</p>
                          <p className={cn("text-xs", t.textMuted)}>Dodano: {new Date(item.created_at).toLocaleDateString("pl-PL")}</p>
                        </div>
                        <button onClick={() => deleteFifoItem(item.id)} className={cn("p-2 transition-colors hover:text-red-400", t.textMuted)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {fifoItems.length === 0 && (
                    <div className="text-center py-12">
                      <Layers className={cn("w-14 h-14 mx-auto mb-4", t.textMuted)} />
                      <p className={t.textSecondary}>Kolejka FIFO jest pusta</p>
                      <p className={cn("text-sm", t.textMuted)}>Dodaj zadania powyżej</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ SHARING VIEW ═══════ */}
          {activeView === "sharing" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* invite */}
              <div className={cn("p-6 rounded-2xl border", t.cardBg)}>
                <h3 className={cn("text-lg font-semibold mb-4", t.textPrimary)}>Zaproś użytkownika</h3>
                <div className="flex gap-3">
                  <input type="text" placeholder="Wpisz email lub nazwę użytkownika..." className={cn("flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all", t.inputBg)} />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={cn("px-6 py-3 rounded-xl font-medium flex items-center gap-2", t.btnPrimary)}>
                    <UserPlus className="w-5 h-5" />
                    <span className="hidden sm:inline">Zaproś</span>
                  </motion.button>
                </div>
              </div>

              {/* shared users */}
              <div className={cn("p-6 rounded-2xl border", t.cardBg)}>
                <h3 className={cn("text-lg font-semibold mb-4", t.textPrimary)}>Użytkownicy z dostępem</h3>
                <div className="space-y-3">
                  {sharedUsers.map((user) => (
                    <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all", t.cardBgAlt, t.cardHover)}>
                      <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0", t.avatarBg)}>
                          <span className={cn("font-semibold text-sm", t.avatarText)}>{user.username.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                          <p className={cn("font-medium", t.textPrimary)}>{user.username}</p>
                          <p className={cn("text-sm", t.textSecondary)}>{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2 flex-wrap">
                          {user.shared_lists.map((list) => (
                            <span key={list} className={cn("px-2 py-1 text-xs rounded-lg", t.tagBg)}>{list}</span>
                          ))}
                        </div>
                        <button className={cn("p-2 transition-colors hover:text-red-400", t.textMuted)}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                  {sharedUsers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className={cn("w-14 h-14 mx-auto mb-4", t.textMuted)} />
                      <p className={t.textSecondary}>Nikt nie ma dostępu do Twoich list</p>
                      <p className={cn("text-sm", t.textMuted)}>Zaproś innych użytkowników powyżej</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════ SETTINGS VIEW ═══════ */}
          {activeView === "settings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-2xl">
              {/* profile */}
              <div className={cn("p-6 rounded-2xl border", t.cardBg)}>
                <h3 className={cn("text-lg font-semibold mb-4", t.textPrimary)}>Ustawienia profilu</h3>
                <div className="space-y-4">
                  {[
                    { label: "Nazwa użytkownika", value: user?.username ?? "Brak nazwy użytkownika", type: "text" },
                    { label: "Email", value: user?.email ?? "Brak email w bazie danych", type: "email" },
                    { label: "Imię", value: "", type: "text" },
                    { label: "Nazwisko", value: "", type: "text" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className={cn("block text-sm mb-2", t.textSecondary)}>{field.label}</label>
                      <input type={field.type} defaultValue={field.value} className={cn("w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all", t.inputBg)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* notifications */}
              <div className={cn("p-6 rounded-2xl border", t.cardBg)}>
                <h3 className={cn("text-lg font-semibold mb-4", t.textPrimary)}>Powiadomienia</h3>
                <div className="space-y-4">
                  {["Powiadomienia email", "Przypomnienia o zadaniach"].map((label) => (
                    <label key={label} className="flex items-center justify-between cursor-pointer">
                      <span className={t.textPrimary}>{label}</span>
                      <div className="relative">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className={cn("w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all", t.toggleTrack, t.toggleChecked)} />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={cn("w-full py-3 rounded-xl font-medium transition-all", t.btnPrimary)}>
                Zapisz zmiany
              </motion.button>
            </motion.div>
          )}
        </div>
      </main>

      {/* ─── Task Form Modal ─── */}
      <AnimatePresence>
        {showTaskForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("fixed inset-0 flex items-center justify-center z-50 p-4", t.modalOverlay)} onClick={() => setShowTaskForm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className={cn("p-6 rounded-2xl border w-full max-w-md shadow-2xl", t.modalBg)}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={cn("text-xl font-semibold", t.textPrimary)}>{editingTask ? "Edytuj zadanie" : "Nowe zadanie"}</h2>
                <button onClick={() => setShowTaskForm(false)} className={cn("p-2 transition-colors", t.textSecondary, "hover:text-red-400")}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={cn("block text-sm mb-2", t.textSecondary)}>Tytuł</label>
                  <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Tytuł zadania..." className={cn("w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all", t.inputBg)} />
                </div>
                <div>
                  <label className={cn("block text-sm mb-2", t.textSecondary)}>Opis</label>
                  <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Opis zadania (opcjonalne)..." rows={3} className={cn("w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none transition-all", t.inputBg)} />
                </div>
                <div>
                  <label className={cn("block text-sm mb-2", t.textSecondary)}>Priorytet</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["low", "medium", "high", "critical"] as const).map((p) => (
                      <button key={p} onClick={() => setNewPriority(p)} className={cn("px-3 py-2 rounded-lg text-sm font-medium border transition-all", newPriority === p ? (d ? priorityConfig[p].dark : priorityConfig[p].light) : cn(t.inputBg, "hover:opacity-80"))}>
                        {priorityConfig[p].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={cn("block text-sm mb-2", t.textSecondary)}>Termin (opcjonalne)</label>
                  <input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className={cn("w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all", t.inputBg)} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowTaskForm(false)} className={cn("flex-1 px-4 py-3 rounded-xl font-medium transition-all", t.btnSecondary)}>Anuluj</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => {
                  if (editingTask) {
                    updateTask(editingTask.id, { title: newTitle, description: newDesc, priority: newPriority, deadline: newDeadline || null });
                  } else {
                    addTask({ title: newTitle, description: newDesc, priority: newPriority, status: "pending", is_important: false, deadline: newDeadline || null });
                  }
                  resetForm();
                }} className={cn("flex-1 px-4 py-3 rounded-xl font-medium transition-all", t.btnPrimary)}>
                  {editingTask ? "Zapisz" : "Dodaj"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
