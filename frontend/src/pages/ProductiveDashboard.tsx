import { LoadingSpinner } from "../components/LoadingSpinner";
import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
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
import { Sidebar } from "../components/Dashboard/SideBar.tsx";
import { FifoView } from "../components/Dashboard/FIFOView.tsx";
import { TasksView } from "../components/Dashboard/Tasks/TasksView.tsx";
import { MainContentHeaderView } from "../components/Dashboard/MainContentHeaderView.tsx";

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

interface TokenData {
  tokenString: string;
  expiresIn: string;
}

const sampleFifoItems: FifoItem[] = [
  { id: 1, title: "Naprawić bug w logowaniu", created_at: "2024-02-15" },
  { id: 2, title: "Zrobić backup bazy danych", created_at: "2024-02-14" },
  { id: 3, title: "Przeczytać artykuł o React 19", created_at: "2024-02-13" },
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

function getToken(option: "access_token" | "refresh_token"): TokenData | null {
  const tokenKey = option;
  const expiresKey = `${option}_expires_in`;
  
  const token = localStorage.getItem(tokenKey);
  const expires = localStorage.getItem(expiresKey);

  if (!token) return null;

  return {
    tokenString: token,
    expiresIn: expires || ""
  };
}

async function refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(
        "https://justtodo.adam-mazurek.pl/api/api/refresh/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh: refreshToken,
          }),
        }
      );

      if (!response.ok) {
        // 401 lub 400
        console.error("Refresh failed:", response.status);
        return null;
      }

      const data: { access: string } = await response.json();

      // zapisujemy nowy access token
      localStorage.setItem("access_token", data.access);

      return data.access;
    } catch (error) {
      console.error("Network error during refresh:", error);
      return null;
    }
};

// Funkcja pomocnicza do sprawdzania czy token wygasł
const isTokenExpired = (option: "access" | "refresh"): boolean => {
  const expiresAt = localStorage.getItem(`${option}_token_expires_at`);
  if (!expiresAt) return true;

  // Porównujemy dwie liczby w tym samym formacie (milisekundy)
  // Odejmujemy 10 sekund marginesu na opóźnienie sieci
  return Date.now() >= (parseInt(expiresAt) - 10000);
};

// GŁÓWNA FUNKCJA DO ZAPYTAŃ
const smartFetch = async (url: string, options: any = {}, retryCount = 0) => {
  let authData = getToken("access_token");

  // 1. Jeśli tokenu nie ma LUB wygasł - odświeżamy
  if (!authData?.tokenString || isTokenExpired("access")) {
    console.log("Token wygasł lub brak, próbuję odświeżyć...");
    const newToken = await refreshAccessToken();
    
    if (!newToken) {
      throw new Error("UNAUTHORIZED");
    }
    
    // Pobierz świeże dane po odświeżeniu
    authData = getToken("access_token");
  }

  // 2. Dodaj aktualny token do nagłówków
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${authData?.tokenString}`,
    'Content-Type': 'application/json'
  };

  // 3. Wykonaj właściwe zapytanie
  const response = await fetch(url, { ...options, headers });

  // 4. Jeśli serwer i tak zwróci 401 (np. token zczyszczony na serwerze)
  if (response.status === 401 && retryCount < 1) {
    const retryToken = await refreshAccessToken();
    if (!retryToken) throw new Error("UNAUTHORIZED");
    
    // Ponów zapytanie raz jeszcze z nowym tokenem
    return smartFetch(url, options, retryCount + 1); 
  }

  return response;
};

// ── Component ──────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("tasks");
  const [fifoItems, setFifoItems] = useState<FifoItem[]>(sampleFifoItems);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [taskSearch, setTaskSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const API_URL = import.meta.env.VITE_API_URL;

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();

    // Przekierowanie na stronę główną
    navigate("/", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        refreshAccessToken().then((newToken) => {
          if (!newToken) {
            navigate("/", { replace: true });
          }
        });
      } else {
        navigate("/", { replace: true });
        return;
      }
    }

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
      // Używamy smartFetch zamiast fetch - on sam doda Bearer Token!
      const res = await smartFetch(`${API_URL}/api/api/tasks/`, {
        method: "POST",
        body: JSON.stringify(taskData),
      });

      if (!res.ok) throw new Error("Błąd dodawania taska");
      await fetchTasks();
      resetForm(); // Dodaj resetowanie formularza po sukcesie
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") navigate("/", { replace: true });
      console.error(err);
    }
  };

  // =========================
  // UPDATE TASK
  // =========================
  const updateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const res = await smartFetch(`${API_URL}/api/api/tasks/?id=${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Błąd aktualizacji taska");
      await fetchTasks();
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") navigate("/", { replace: true });
      console.error(err);
    }
  };

  // =========================
  // DELETE TASK
  // =========================
  const deleteTask = async (id: number) => {
    try {
      const res = await smartFetch(`${API_URL}/api/api/tasks/?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Błąd usuwania taska");
      await fetchTasks();
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") navigate("/", { replace: true });
      console.error(err);
    }
  };
  // =========================
  // FETCH TASKS
  // =========================
  const fetchTasks = async (filter: TaskFilter = taskFilter) => {
    setLoading(true);

    let url = `${API_URL}/api/api/tasks/`;
    const params = new URLSearchParams();

    if (filter === "pending") params.append("status", "pending");
    if (filter === "completed") params.append("status", "completed");
    if (filter === "important") params.append("important", "true");
    if (filter === "critical") params.append("priority", "critical");

    const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;

    try {
      const res = await smartFetch(finalUrl);
      if (!res.ok) throw new Error("Błąd pobierania danych z serwera");
      
      const data = await res.json();
      setTasks(data);
      
    } catch (err: any) {
        // 3. Jeśli smartFetch rzuci błąd UNAUTHORIZED, przekierowujemy
      if (err.message === "UNAUTHORIZED") {
        navigate("/", { replace: true });
      } else {
        console.error("Fetch Error:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH ALL USERS
  // =========================
  const fetchAllUsers = async () => {
    try {
      const res = await smartFetch(`${API_URL}/api/api/allusers/`);
      if (!res.ok) throw new Error("Błąd pobierania użytkowników");
      
      const data = await res.json();
      setSharedUsers(data); // Tu dane z Postgresa wpadają do frontendu
    } catch (err: any) {
      console.error("Błąd fetchAllUsers:", err);
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

  useEffect(() => {
    fetchTasks(taskFilter);
    fetchAllUsers();
    // smartFetch(API_URL, taskFilter)
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

  const prepareEditTask = (task: Task) => {
    setEditingTask(task);
    setNewTitle(task.title);
    setNewDesc(task.description);
    setNewPriority(task.priority);
    setNewDeadline(task.deadline || "");
    setShowTaskForm(true);
  };

  const openAddForm = () => {
    resetForm();
    setShowTaskForm(true);
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className={cn("min-h-screen flex", t.mainBg)}>
      {/* ─── Tło + animacje ─── */}
      <MainContentHeaderView 
            activeView={activeView} 
            navItems={navItems} 
            t={t} 
          />
      
      {/* ─── Sidebar jako osobny komponent ─── */}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        activeView={activeView}
        setActiveView={setActiveView}
        navItems={navItems}
        handleLogout={handleLogout}
        toggleTheme={toggleTheme}
        theme={theme}
        t={t}
      />
            
      {/* ─── Main Content ─── */}
      <main className="flex-1 h-screen overflow-hidden relative z-10 flex flex-col">
        <div className="p-6 md:p-8 max-w-6xl mx-auto w-full flex flex-col h-full">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex-shrink-0 mb-8">
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

          {activeView === "tasks" && (
            <TasksView 
              loading={loading}
              stats={stats}
              t={t}
              d={d}
              taskFilter={taskFilter}
              setTaskFilter={setTaskFilter}
              taskSearch={taskSearch}
              setTaskSearch={setTaskSearch}
              filteredTasks={filteredTasks}
              priorityConfig={priorityConfig}
              statusConfig={statusConfig}
              toggleComplete={toggleComplete}
              toggleImportant={toggleImportant}
              deleteTask={deleteTask}
              prepareEditTask={prepareEditTask}
              openAddForm={openAddForm}
            />
          )}
          {/* ═══════ FIFO VIEW ═══════ */}
          {activeView === "fifo" && (
            <FifoView 
              fifoItems={fifoItems}
              newFifo={newFifo}
              setNewFifo={setNewFifo}
              addFifoItem={addFifoItem}
              dequeueFifoItem={dequeueFifoItem}
              deleteFifoItem={deleteFifoItem}
              t={t}
            />
          )}

          {/* shared users */}
          {activeView === "sharing" && (
            <div className={cn("p-6 rounded-2xl border", t.cardBg)}>
              <h3 className={cn("text-lg font-semibold mb-4", t.textPrimary)}>Użytkownicy z dostępem</h3>
              <div className="space-y-3">
                {sharedUsers.map((user) => (
                  <motion.div key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all", t.cardBgAlt, t.cardHover)}>
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0", t.avatarBg)}>
                        <span className={cn("font-semibold text-sm", t.avatarText)}>
                          {(user.username || "??").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className={cn("font-medium", t.textPrimary)}>{user.username}</p>
                        <p className={cn("text-sm", t.textSecondary)}>
                          {/* Poprawka: wyświetlanie "brak e-mail" */}
                          {user.email && user.email.trim() !== "" 
                            ? user.email 
                            : <span className="italic opacity-50 text-xs">brak e-mail</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-2 flex-wrap">
                        {/* KLUCZOWA POPRAWKA: user.shared_lists?.map oraz || [] */}
                        {(user.shared_lists || []).map((list) => (
                          <span key={list} className={cn("px-2 py-1 text-xs rounded-lg", t.tagBg)}>{list}</span>
                        ))}
                        {/* {(!user.shared_lists || user.shared_lists.length === 0) && (
                          <span className={cn("text-xs italic", t.textMuted)}>Brak list</span>
                        )} */}
                      </div>
                      {/* <button className={cn("p-2 transition-colors hover:text-red-400", t.textMuted)}>
                        <Trash2 className="w-4 h-4" />
                      </button> */}
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
