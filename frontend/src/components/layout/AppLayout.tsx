import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiActivity, FiHome, FiList, FiBookOpen, FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { label: 'Dashboard', href: '/', icon: FiHome },
  { label: 'Workouts', href: '/workouts', icon: FiList },
  { label: 'Exercises', href: '/exercises', icon: FiBookOpen },
  { label: 'ExerciseDetail', href: '/exercises/:id', icon: FiBookOpen },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/' || router.pathname === '/dashboard';
    return router.pathname.startsWith(href);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50 text-slate-900">
      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed z-40 lg:static lg:z-auto
        w-60 h-screen flex flex-col bg-white border-r border-slate-200
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="px-6 py-5 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-lime-500 flex items-center justify-center">
            <FiActivity className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">PulseArk</span>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}>
            <FiX className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                  active
                    ? 'bg-lime-50 text-lime-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setOpen(false)}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-slate-200">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-lime-200 flex items-center justify-center text-sm font-bold text-lime-800">M</div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">Maya Torres</p>
              <p className="text-xs text-slate-400">Premium plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-white">
          <button onClick={() => setOpen(true)}>
            <FiMenu className="w-5 h-5" />
          </button>
          <FiActivity className="w-5 h-5 text-lime-500" />
          <span className="font-extrabold">PulseArk</span>
        </div>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}