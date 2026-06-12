import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/**
 * 右侧滑出抽屉容器。
 * 打开时锁定背景滚动并补偿滚动条宽度，避免页面内容偏移。
 */
export default function Drawer({ open, onClose, title, children }: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // 锁定背景滚动（scrollbar-gutter: stable 已在 html 上预留了滚动条空间）
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape 关闭
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <>
      {/* 遮罩 */}
      <div
        ref={overlayRef}
        className={`fixed inset-0 bg-black/30 z-[100] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* 抽屉面板 */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-[var(--color-surface)] z-[101] shadow-xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-md text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-bg)] transition-colors"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">{children}</div>
      </div>
    </>
  );
}
