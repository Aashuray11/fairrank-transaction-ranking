import { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiBarChart2, FiHome, FiList, FiMenu, FiMoon, FiSun, FiUser } from "react-icons/fi";
import { RiExchangeFundsLine } from "react-icons/ri";

import { useTheme } from "../context/ThemeContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: FiHome },
  { to: "/add-transaction", label: "Add Transaction", icon: RiExchangeFundsLine },
  { to: "/user-summary", label: "User Summary", icon: FiUser },
  { to: "/leaderboard", label: "Leaderboard", icon: FiList },
  { to: "/analytics", label: "Analytics", icon: FiBarChart2 },
];

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 z-40 w-full border-b border-white/30 dark:border-slate-700/50 glass">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="rounded-xl p-2 text-slate-700 transition hover:bg-white/70 dark:text-slate-200 md:hidden"
            >
              <FiMenu size={20} />
            </button>
            <div>
              <p className="font-display text-xl font-bold text-primary">FairRank</p>
              <p className="text-xs text-slate-500 dark:text-slate-300">Secure Transaction Intelligence</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl border border-slate-200/70 bg-white/60 p-2 text-slate-700 transition hover:scale-105 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100"
          >
            {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
          </button>
        </div>
      </header>

      <aside
        className={`fixed left-0 top-[72px] z-30 h-[calc(100vh-72px)] w-72 border-r border-white/30 glass p-4 transition-transform dark:border-slate-700/50 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="mb-5 flex items-center justify-between md:hidden">
          <span className="font-display text-sm font-semibold">Navigation</span>
          <button type="button" onClick={() => setOpen(false)}>
            <FiBarChart2 />
          </button>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-primary to-secondary text-white"
                      : "text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-slate-800/70"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-24 md:pl-[320px] md:pr-6">{children}</main>
    </div>
  );
}
