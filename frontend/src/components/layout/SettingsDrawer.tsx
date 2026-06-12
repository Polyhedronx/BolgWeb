import { Sun, Moon, LogIn, LogOut, User } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

const roleLabel: Record<string, string> = {
  admin: "管理员",
  user: "用户",
  premium: "高级用户",
};

interface SettingsDrawerProps {
  /** 当前主题: true=暗色 */
  isDark?: boolean;
  onToggleTheme?: () => void;
  /** 用户信息（null = 未登录） */
  user?: { username: string; email?: string; role?: string } | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

export default function SettingsDrawer({
  isDark = false,
  onToggleTheme,
  user,
  onLogin,
  onLogout,
}: SettingsDrawerProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 用户卡片 */}
      <div className="flex flex-col items-center gap-3 py-4">
        {user ? (
          <>
            <Avatar name={user.username} email={user.email} size={56} />
            <div className="text-center">
              <p className="font-medium text-sm">{user.username}</p>
              {user.role && (
                <span className="text-xs text-[var(--color-muted)]">{roleLabel[user.role] || user.role}</span>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-[var(--color-bg)] flex items-center justify-center">
              <User className="h-6 w-6 text-[var(--color-muted)]" />
            </div>
            <p className="text-sm text-[var(--color-muted)]">未登录</p>
          </>
        )}
      </div>

      <hr className="border-[var(--color-border)]" />

      {/* 主题切换 */}
      <div className="flex items-center justify-between">
        <span className="text-sm flex items-center gap-2">
          {isDark ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          {isDark ? "暗色模式" : "亮色模式"}
        </span>
        <button
          onClick={onToggleTheme}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            isDark ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              isDark ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      <hr className="border-[var(--color-border)]" />

      {/* 登录 / 退出 */}
      {user ? (
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      ) : (
        <button
          onClick={onLogin}
          className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          <LogIn className="h-4 w-4" />
          登录 / 注册
        </button>
      )}
    </div>
  );
}
