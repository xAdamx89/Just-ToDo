import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../../utils/cn";

interface TasksModalProps {
  showTaskForm: boolean;
  setShowTaskForm: (show: boolean) => void;
  editingTask: any;
  newTitle: string;
  setNewTitle: (val: string) => void;
  newDesc: string;
  setNewDesc: (val: string) => void;
  newPriority: string;
  setNewPriority: (val: any) => void;
  newDeadline: string;
  setNewDeadline: (val: string) => void;
  priorityConfig: any;
  t: any;
  d: boolean;
  onSave: () => void;
  resetForm: () => void;
}

export function TasksModal({
  showTaskForm,
  setShowTaskForm,
  editingTask,
  newTitle,
  setNewTitle,
  newDesc,
  setNewDesc,
  newPriority,
  setNewPriority,
  newDeadline,
  setNewDeadline,
  priorityConfig,
  t,
  d,
  onSave,
  resetForm,
}: TasksModalProps) {
  return (
    <AnimatePresence>
      {showTaskForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn("fixed inset-0 flex items-center justify-center z-[100] p-4", t.modalOverlay)}
          onClick={() => setShowTaskForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={cn("p-6 rounded-2xl border w-full max-w-md shadow-2xl", t.modalBg)}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={cn("text-xl font-semibold", t.textPrimary)}>
                {editingTask ? "Edytuj zadanie" : "Nowe zadanie"}
              </h2>
              <button
                onClick={() => setShowTaskForm(false)}
                className={cn("p-2 transition-colors", t.textSecondary, "hover:text-red-400")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={cn("block text-sm mb-2", t.textSecondary)}>Tytuł</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Tytuł zadania..."
                  className={cn("w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all", t.inputBg)}
                />
              </div>
              <div>
                <label className={cn("block text-sm mb-2", t.textSecondary)}>Opis</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Opis zadania (opcjonalne)..."
                  rows={3}
                  className={cn("w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none transition-all", t.inputBg)}
                />
              </div>
              <div>
                <label className={cn("block text-sm mb-2", t.textSecondary)}>Priorytet</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["low", "medium", "high", "critical"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                        newPriority === p
                          ? d
                            ? priorityConfig[p].dark
                            : priorityConfig[p].light
                          : cn(t.inputBg, "hover:opacity-80")
                      )}
                    >
                      {priorityConfig[p].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={cn("block text-sm mb-2", t.textSecondary)}>Termin (opcjonalne)</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className={cn("w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all", t.inputBg)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTaskForm(false)}
                className={cn("flex-1 px-4 py-3 rounded-xl font-medium transition-all", t.btnSecondary)}
              >
                Anuluj
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSave}
                className={cn("flex-1 px-4 py-3 rounded-xl font-medium transition-all", t.btnPrimary)}
              >
                {editingTask ? "Zapisz" : "Dodaj"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}