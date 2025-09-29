"use client";

import { useAuth } from "@/lib/auth/AuthProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  UserCheck,
  Users,
  Calendar,
  MapPin,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const studentNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/attendance", label: "Absensi", icon: UserCheck },
];

const adminNavItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/students", label: "Mahasiswa", icon: Users },
  { href: "/admin/schedule", label: "Jadwal", icon: Calendar },
  { href: "/admin/location", label: "Lokasi", icon: MapPin },
];

export function Navigation() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = profile?.role === "admin" ? adminNavItems : studentNavItems;

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-lg">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Absenin</h1>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {profile?.name?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {profile?.role}
                  </p>
                </div>
                <button
                  onClick={signOut}
                  className="ml-3 text-gray-400 hover:text-gray-600"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Absenin</h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-white shadow-lg">
            <nav className="px-2 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-gray-200 px-4 py-3">
              <button
                onClick={() => {
                  signOut();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Keluar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
