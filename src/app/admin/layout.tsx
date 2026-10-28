"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Map,
  CheckSquare,
  Hotel,
  Train,
  Wallet,
  Settings,
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  User,
  ChevronRight,
  Home,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { cn, getInitials } from "@/lib/utils";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { toast } from "sonner";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["master_admin", "destination_admin"] },
  { href: "/admin/admins", label: "Admin Users", icon: Users, roles: ["master_admin"] },
  { href: "/admin/assignments", label: "Assignments", icon: ClipboardList, roles: ["master_admin", "destination_admin"] },
  { href: "/admin/itinerary-builder", label: "Itinerary Builder", icon: Map, roles: ["master_admin", "destination_admin"] },
  { href: "/admin/approval-center", label: "Approval Center", icon: CheckSquare, roles: ["master_admin"] },
  { href: "/admin/hotels", label: "Hotels & Bookings", icon: Hotel, roles: ["master_admin", "destination_admin"] },
  { href: "/admin/transport", label: "Transport", icon: Train, roles: ["master_admin", "destination_admin"] },
  { href: "/admin/budget", label: "Budget", icon: Wallet, roles: ["master_admin", "destination_admin"] },
  { href: "/admin/settings", label: "Trip Settings", icon: Settings, roles: ["master_admin"] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { appUser, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { unreadCount } = useNotifications(appUser?.uid);

  useEffect(() => {
    if (!loading && !appUser) router.replace("/login");
    if (!loading && appUser && appUser.role === "viewer") router.replace("/dashboard");
  }, [appUser, loading, router]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) return <PageLoader />;
  if (!appUser || appUser.role === "viewer") return null;

  const filteredNav = navItems.filter((item) => item.roles.includes(appUser.role));
  const initials = getInitials(appUser.displayName);
  const roleLabel =
    appUser.role === "master_admin" ? "Master Admin" : "Destination Admin";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-royal-800/50">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="text-2xl">🏛️</span>
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">Royal Routes</p>
            <p className="text-royal-300 text-[10px] uppercase tracking-widest">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Trip indicator */}
      <div className="px-4 py-3 mx-3 my-3 rounded-xl bg-royal-800/60 border border-royal-700/50">
        <p className="text-royal-300 text-[10px] uppercase tracking-wider">Active Trip</p>
        <p className="text-white text-xs font-semibold mt-0.5 leading-tight">
          Rajasthan · Delhi · Agra 2026
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-gold-500 text-white shadow-gold"
                  : "text-royal-200 hover:text-white hover:bg-royal-700/60"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Member view link */}
      <div className="px-3 py-3 border-t border-royal-800/50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-royal-300 hover:text-white hover:bg-royal-700/40 text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          Member View
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ivory-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-royal-gradient fixed inset-y-0 left-0 z-30 shadow-premium-lg">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 bg-royal-gradient h-full shadow-premium-lg z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-royal-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-ivory-200 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-1.5 text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Page title / breadcrumb area rendered by page */}
              <div id="breadcrumb-portal" />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button className="relative p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-stone-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-royal-gradient flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-stone-800 leading-tight">{appUser.displayName}</p>
                    <p className="text-[10px] text-stone-400">{roleLabel}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-ivory-200 rounded-2xl shadow-premium-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-ivory-100">
                      <p className="text-sm font-semibold text-stone-900">{appUser.displayName}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{appUser.email}</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={async () => {
                          setUserMenuOpen(false);
                          toast.success("Signed out successfully");
                          await logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

