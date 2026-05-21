'use client';

import Link from 'next/link';
import { BarChart3, FileText, Settings, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/invoices', label: 'Factures', icon: FileText },
    { href: '/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-12">
          <BarChart3 className="h-8 w-8 text-red-500" />
          <h1 className="text-xl font-bold text-white">TaxiCompta</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-red-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-800">
          <button
            onClick={() => alert('Déconnexion (mode test)')}
            className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64">
        <div className="bg-white border-b border-slate-200">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              {navItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
            </h2>
          </div>
        </div>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
