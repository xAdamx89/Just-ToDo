import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { cn } from "../../utils/cn";

interface SharedUser {
  id: number;
  username: string;
  email: string;
  shared_lists: string[];
}

interface SharingViewProps {
  sharedUsers: SharedUser[];
  t: any;
}

export function SharingView({ sharedUsers, t }: SharingViewProps) {
  return (
    <div className={cn("p-6 rounded-2xl border", t.cardBg)}>
      <h3 className={cn("text-lg font-semibold mb-4", t.textPrimary)}>
        Użytkownicy z dostępem
      </h3>
      <div className="space-y-3">
        {sharedUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center justify-between p-4 rounded-xl border transition-all",
              t.cardBgAlt,
              t.cardHover
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border flex-shrink-0",
                  t.avatarBg
                )}
              >
                <span className={cn("font-semibold text-sm", t.avatarText)}>
                  {(user.username || "??").slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className={cn("font-medium", t.textPrimary)}>{user.username}</p>
                <p className={cn("text-sm", t.textSecondary)}>
                  {user.email && user.email.trim() !== "" ? (
                    user.email
                  ) : (
                    <span className="italic opacity-50 text-xs">brak e-mail</span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 flex-wrap">
                {(user.shared_lists || []).map((list) => (
                  <span key={list} className={cn("px-2 py-1 text-xs rounded-lg", t.tagBg)}>
                    {list}
                  </span>
                ))}
              </div>
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
  );
}