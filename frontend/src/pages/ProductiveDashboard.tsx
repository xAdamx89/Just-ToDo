import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ListTodo,
  Layers,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useMemo } from "react";
import { Sidebar } from "../components/Dashboard/SideBar.tsx";
import { FifoView } from "../components/Dashboard/FIFOView.tsx";
import { TasksView } from "../components/Dashboard/Tasks/TasksView.tsx";
import { MainContentHeaderView } from "../components/Dashboard/MainContentHeaderView.tsx";
import { SharingView } from "../components/Dashboard/SharedUsersView.tsx";
import { SettingsView } from "../components/Dashboard/SettingsView.tsx";

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

type TaskFilter =  "critical" | "high" | "medium" | "low";

export interface TaskFilterState {
  status: "all" | "pending" | "in_progres" | "completed" | "canceled";
  priority: "all" | "low" | "medium" | "high" | "critical";
}

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
  //const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [taskFilter, setTaskFilter] = useState<TaskFilterState>({
    status: "all",
    priority: "all",
  });
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
  const fetchTasks = async (currentFilters: TaskFilterState = taskFilter) => {
    setLoading(true);

    const url = `${API_URL}/api/api/tasks/`;
    const params = new URLSearchParams();

    // 1. Dodajemy status do URL, jeśli nie jest "all"
    if (currentFilters.status !== "all") {
      params.append("status", currentFilters.status);
    }

    // 2. Dodajemy priorytet do URL, jeśli nie jest "all"
    if (currentFilters.priority !== "all") {
      params.append("priority", currentFilters.priority);
    }

    const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;

    try {
      const res = await smartFetch(finalUrl);
      if (!res.ok) throw new Error("Błąd pobierania danych z serwera");
      
      const data = await res.json();
      setTasks(data);
      
    } catch (err: any) {
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
  // 1. Kopiujemy tablicę na starcie
  let result = [...tasks]; 

  // 2. SEARCH (Wyszukiwanie tekstowe)
  if (taskSearch.trim() !== "") {
    const query = taskSearch.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
    );
  }

  // 3. FILTROWANIE (Status + Priorytet)
  result = result.filter(t => {
    // Sprawdzamy status (jeśli "all", to ignorujemy ten filtr)
    const matchesStatus = taskFilter.status === "all" || t.status === taskFilter.status;
    // Sprawdzamy priorytet (jeśli "all", to ignorujemy ten filtr)
    const matchesPriority = taskFilter.priority === "all" || t.priority === taskFilter.priority;
    
    return matchesStatus && matchesPriority;
  });

  // 4. SORTOWANIE (Wewnątrz useMemo!)
  const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
  
  result.sort((a, b) => {
    const weightA = priorityWeight[a.priority] || 0;
    const weightB = priorityWeight[b.priority] || 0;
    
    if (weightA !== weightB) {
      return weightB - weightA; // Wyższy priorytet na górę
    }
    
    // Jeśli priorytety równe, sortuj po dacie (od najnowszych)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // 5. Zwracamy gotową listę
  return result;

}, [tasks, taskSearch, taskFilter]); // Tu zamykamy useMemo
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
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className={cn("absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl", d ? "bg-orange-500/8" : "bg-amber-300/20")} />
        <motion.div animate={{ scale: [1.2, 1, 1.2], rotate: [90, 0, 90] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className={cn("absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl", d ? "bg-amber-500/8" : "bg-orange-200/20")} />
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className={cn("absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl", d ? "bg-red-900/5" : "bg-yellow-200/15")} />
      </div>

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
          <MainContentHeaderView 
                activeView={activeView} 
                navItems={navItems} 
                t={t} 
              />

          {activeView === "tasks" && (
            <TasksView 
              // Podstawowe propsy (te już masz)
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

              // NOWE PROPSY (Dopisujemy to, czego brakuje w błędzie)
              showTaskForm={showTaskForm}
              setShowTaskForm={setShowTaskForm}
              editingTask={editingTask}
              newTitle={newTitle}
              setNewTitle={setNewTitle}
              newDesc={newDesc}
              setNewDesc={setNewDesc}
              newPriority={newPriority}
              setNewPriority={setNewPriority}
              newDeadline={newDeadline}
              setNewDeadline={setNewDeadline}
              resetForm={resetForm}
              handleSaveTask={() => {
                if (editingTask) {
                  updateTask(editingTask.id, { 
                    title: newTitle, 
                    description: newDesc, 
                    priority: newPriority, 
                    deadline: newDeadline || null 
                  });
                } else {
                  addTask({ 
                    title: newTitle, 
                    description: newDesc, 
                    priority: newPriority, 
                    status: "pending", 
                    is_important: false, 
                    deadline: newDeadline || null 
                  });
                }
              }}
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

          {activeView === "sharing" && (
            <SharingView 
              sharedUsers={sharedUsers} 
              t={t} 
            />
          )}

          {activeView === "settings" && (
            <SettingsView 
              user={user} 
              t={t} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
