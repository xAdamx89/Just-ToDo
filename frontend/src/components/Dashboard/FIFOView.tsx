import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight, CheckCircle2, Trash2, Layers } from "lucide-react";
import { cn } from "../../utils/cn";

// Definicja typów dla tego komponentu
interface FifoItem {
  id: number;
  title: string;
  created_at: string;
}

interface FifoViewProps {
  fifoItems: FifoItem[];
  newFifo: string;
  setNewFifo: (val: string) => void;
  addFifoItem: () => void;
  dequeueFifoItem: () => void;
  deleteFifoItem: (id: number) => void;
  t: any; // klasy motywu
}

export function FifoView({
  fifoItems,
  newFifo,
  setNewFifo,
  addFifoItem,
  dequeueFifoItem,
  deleteFifoItem,
  t,
}: FifoViewProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* add */}
        <div className={cn("p-6 rounded-2xl border", t.cardBg)}>
          <h3 className={cn("text-lg font-semibold mb-1", t.textPrimary)}>Dodaj do kolejki</h3>
          <p className={cn("text-sm mb-4", t.textSecondary)}>Nowe zadanie trafia na koniec kolejki</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={newFifo}
              onChange={(e) => setNewFifo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addFifoItem()}
              placeholder="Co musisz zrobić?"
              className={cn("flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all", t.inputBg)}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addFifoItem}
              className={cn("px-6 py-3 rounded-xl font-medium", t.btnPrimary)}
            >
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={dequeueFifoItem}
                className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 flex items-center gap-2 flex-shrink-0"
              >
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
          <h3 className={cn("text-lg font-semibold", t.textPrimary)}>
            Kolejka FIFO ({fifoItems.length} {fifoItems.length === 1 ? "zadanie" : "zadań"})
          </h3>
          <span className={cn("text-sm", t.textSecondary)}>Pierwszy dodany → pierwszy do wykonania</span>
        </div>
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {fifoItems.map((item: FifoItem, index: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn("flex items-center gap-4 p-4 rounded-xl border transition-all", index === 0 ? t.lifoActive : t.cardBgAlt)}
              >
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
  );
}