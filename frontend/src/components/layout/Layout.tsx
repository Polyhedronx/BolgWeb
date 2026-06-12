import { useState, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Header from "./Header";
import Footer from "./Footer";
import Drawer from "@/components/ui/Drawer";
import SettingsDrawer from "./SettingsDrawer";

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // TODO: isDark 等到 Phase 5 完善主题时接入
  const isDark = false;
  const toggleTheme = () => { /* Phase 5 */ };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onOpenDrawer={openDrawer} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      <Footer />

      <Drawer open={drawerOpen} onClose={closeDrawer} title="设置">
        <SettingsDrawer
          isDark={isDark}
          onToggleTheme={toggleTheme}
          user={user}
          onLogin={() => {
            closeDrawer();
            navigate("/login");
          }}
          onLogout={() => {
            logout();
            closeDrawer();
          }}
        />
      </Drawer>
    </div>
  );
}
