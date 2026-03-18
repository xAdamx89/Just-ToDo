import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, CheckCircle2, Star, Calendar, Edit3, Trash2, ListTodo } from "lucide-react";
import { cn } from "../../../utils/cn";
import { LoadingSpinner } from "../../LoadingSpinner";
import { TasksModal } from "./TasksModal";
import { TaskFilterState } from "../../../pages/ProductiveDashboard";

// Definicje typów (powinny być spójne z tymi w Dashboardzie)
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

const priorityLabels: Record<string, string> = {
  all: "Wszystkie",
  low: "Niski",
  medium: "Średni",
  high: "Wysoki",
  critical: "Krytyczny"
};


interface TasksViewProps {
  loading: boolean;
  stats: any;
  t: any;
  d: boolean;
  taskSearch: string;
  taskFilter: TaskFilterState;
  setTaskFilter: React.Dispatch<React.SetStateAction<TaskFilterState>>;
  setTaskSearch: (s: string) => void;
  filteredTasks: Task[];
  priorityConfig: any;
  statusConfig: any;
  toggleComplete: (task: Task) => void;
  toggleImportant: (task: Task) => void;
  deleteTask: (id: number) => void;
  prepareEditTask: (task: Task) => void;
  openAddForm: () => void;
  
  // NOWE PROPSY DLA MODALA
  showTaskForm: boolean;
  setShowTaskForm: (show: boolean) => void;
  editingTask: Task | null;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newDesc: string;
  setNewDesc: (val: string) => void;
  newPriority: Task["priority"];
  setNewPriority: (p: Task["priority"]) => void;
  newDeadline: string;
  setNewDeadline: (val: string) => void;
  handleSaveTask: () => void; // Funkcja zapisu z Dashboardu
  resetForm: () => void;
}

export function TasksView({
  loading, stats, t, d, taskFilter, setTaskFilter,
  taskSearch, setTaskSearch, filteredTasks,
  priorityConfig, statusConfig,
  toggleComplete, toggleImportant, deleteTask,
  prepareEditTask, openAddForm,
  
  // Destrukturyzacja nowych propsów
  showTaskForm, setShowTaskForm, editingTask,
  newTitle, setNewTitle, newDesc, setNewDesc,
  newPriority, setNewPriority, newDeadline, setNewDeadline,
  handleSaveTask, resetForm
}: TasksViewProps) {
return (
    <> 
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col h-full overflow-hidden space-y-6"
      >
        {/* Stats */}
        <div className="flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4 p-1">
          {[
            { label: "Wszystkie", value: stats.total, color: t.statAll, filter: "all" },
            { label: "Do zrobienia", value: stats.pending, color: t.statPending, filter: "pending" },
            { label: "Ukończone", value: stats.completed, color: t.statDone, filter: "completed" },
            { label: "Krytyczne", value: stats.important, color: t.statImportant, filter: "critical" },
          ].map((s) => (
            <div
              key={s.label}
              className={cn(
                "p-4 rounded-2xl border cursor-pointer transition-all",
                t.cardBg,
                taskFilter.status === s.filter ? "ring-2 ring-amber-500" : ""
              )}
              onClick={() => setTaskFilter({ status: s.filter as any, priority: "all" })}
            >
              <p className={cn("text-sm mb-1", t.textSecondary)}>{s.label}</p>
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex-shrink-0 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            
            {/* Kontener na przyciski filtrów */}
            <div className="flex flex-col gap-2">

              {/* Rząd 1: Statusy */}
              <div className="flex gap-2 flex-wrap">
              {(["all", "pending", "completed"] as const).map((s) => (
                <button
                  key={s}
                  // Zmieniono na setTaskFilter
                  onClick={() => setTaskFilter(prev => ({ ...prev, status: s }))}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    // Zmieniono na taskFilter.status
                    taskFilter.status === s ? t.filterActive : t.filterInactive
                  )}
                >
                    {s === "all" ? "Wszystkie" : s === "pending" ? "Do zrobienia" : "Ukończone"}
                  </button>
                ))}
              </div>

              {/* Rząd 2: Priorytety */}
              <div className="flex gap-2 flex-wrap">
                {(["all", "low", "medium", "high", "critical"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setTaskFilter(prev => ({ ...prev, priority: p }))}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                    taskFilter.priority === p
                      ? "bg-amber-500 text-white border-amber-500" 
                      : cn(t.filterInactive, "border-transparent")
                  )}
                >
                  {priorityLabels[p]}
                </button>
              ))}
              </div>

              {/* Wyszukiwarka i Dodawanie */}
              <div className="flex gap-3 w-full md:w-auto self-end md:self-center">
              <div className="relative flex-1 md:w-64">
                <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4", t.textSecondary)} />
                <input
                  type="text"
                  placeholder="Szukaj zadań..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className={cn("w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all", t.inputBg)}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAddForm}
                className={cn("px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all", t.btnPrimary)}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Dodaj</span>
              </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0">
          <div className="space-y-3 pb-20">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(
                    "p-4 rounded-2xl border group transition-all",
                    t.cardBg,
                    t.cardHover,
                    task.is_important && t.taskImportantRing,
                    task.status === "completed" && t.taskCompleted
                  )}
                >
                  <div className="flex items-start gap-4">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleComplete(task)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                        task.status === "completed" ? "bg-emerald-500 border-emerald-500" : t.checkboxIdle
                      )}
                    >
                      {task.status === "completed" && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </motion.button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn("font-medium truncate", task.status === "completed" ? t.taskCompletedText : t.textPrimary)}>
                          {task.title}
                        </h3>
                        {task.is_important && <Star className={cn("w-4 h-4 fill-amber-400 flex-shrink-0", d ? "text-amber-400" : "text-amber-500")} />}
                      </div>
                      {task.description && <p className={cn("text-sm mb-2 truncate", t.textSecondary)}>{task.description}</p>}

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", d ? priorityConfig[task.priority].dark : priorityConfig[task.priority].light)}>
                          {priorityConfig[task.priority].label}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", d ? statusConfig[task.status].dark : statusConfig[task.status].light)}>
                          {statusConfig[task.status].label}
                        </span>
                        {task.deadline && (
                          <span className={cn("flex items-center gap-1 text-xs", t.textMuted)}>
                            <Calendar className="w-3 h-3" />
                            {new Date(task.deadline).toLocaleDateString("pl-PL")}
                          </span>
                        )}
                        <span className={cn("flex items-center gap-1 text-xs", t.textMuted)}>
                          <Plus className="w-3 h-3" />
                          Utworzono: {new Date(task.created_at).toLocaleDateString("pl-PL")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleImportant(task)} className={cn("p-2 transition-colors", t.textSecondary, "hover:text-amber-400")}>
                        <Star className={cn("w-4 h-4", task.is_important && "fill-amber-400 text-amber-400")} />
                      </button>
                      <button
                        onClick={() => prepareEditTask(task)}
                        className={cn("p-2 transition-colors", t.textSecondary, "hover:text-blue-400")}
                      >
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
        </div>
      </motion.div>

      {/* MODAL */}
      <TasksModal
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
        priorityConfig={priorityConfig}
        t={t}
        d={d}
        onSave={handleSaveTask}
        resetForm={resetForm}
      />
    </>
  );
}