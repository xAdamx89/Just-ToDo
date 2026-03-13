import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../utils/cn"; // upewnij się, że ścieżka jest poprawna

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({ message = "Ładowanie danych...", className }: LoadingSpinnerProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("flex flex-col items-center justify-center py-12 w-full", className)}
    >
      {/* Kółeczko z animacją obrotu */}
      <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
      
      {/* Pulsujący tekst */}
      <motion.p 
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm font-medium text-amber-500/70"
      >
        {message}
      </motion.p>
    </motion.div>
  );
}