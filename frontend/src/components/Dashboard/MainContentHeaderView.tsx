import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

interface ViewHeaderProps {
  activeView: string;
  navItems: { id: string; label: string }[];
  t: any; // klasy motywu
}

export function MainContentHeaderView({ activeView, navItems, t }: ViewHeaderProps) {
  // Funkcja pomocnicza do pobierania opisu - czyściej niż w JSX
  const getViewDescription = () => {
    switch (activeView) {
      case "tasks":
        return "Zarządzaj swoimi zadaniami";
      case "fifo":
        return "Metoda FIFO — Pierwszy dodany, pierwszy do wykonania";
      case "sharing":
        return "Współdziel swoje listy z innymi";
      case "settings":
        return "Dostosuj aplikację do swoich potrzeb";
      default:
        return "";
    }
  };

  return (
    <motion.div 
      key={activeView} // Klucz sprawi, że animacja odpali się przy każdej zmianie widoku
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="flex-shrink-0 mb-8"
    >
      <h1 className={cn("text-3xl font-bold mb-1", t.textPrimary)}>
        {navItems.find((n) => n.id === activeView)?.label}
      </h1>
      <p className={t.textSecondary}>
        {getViewDescription()}
      </p>
    </motion.div>
  );
}