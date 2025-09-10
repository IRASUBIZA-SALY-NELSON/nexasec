"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Network, 
  ShieldAlert, 
  FileBarChart, 
  Settings, 
  LogOut,
  Menu,
  X,
  Terminal,
  Scan
} from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthContext();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Network",
      href: "/dashboard/network",
      icon: <Network className="h-5 w-5" />,
    },
    {
      name: "Network Scan",
      href: "/dashboard/network-scan",
      icon: <Scan className="h-5 w-5" />,
    },
    {
      name: "Vulnerabilities",
      href: "/dashboard/vulnerabilities",
      icon: <ShieldAlert className="h-5 w-5" />,
    },
    {
      name: "Penetration Testing",
      href: "/dashboard/pentest",
      icon: <Terminal className="h-5 w-5" />,
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: <FileBarChart className="h-5 w-5" />,
    },
    {
      name: "Logs",
      href: "/dashboard/logs",
      icon: <Terminal className="h-5 w-5" />,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Helper function to handle navigation
  const handleNavigation = (href: string) => {
    router.push(href);
  };

  // Check if a link is active
  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-800/80 backdrop-blur-sm border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700/80 transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-gray-900/95 backdrop-blur-sm border-r border-gray-800 transition-all duration-300 ease-in-out z-40 ${
          sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-center h-16 border-b border-gray-800 px-4">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="NexaSec Logo" className="h-12" />
            </Link>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`flex items-center w-full px-4 py-3 rounded-md transition-colors text-left ${
                  isLinkActive(item.href)
                    ? "bg-cyan-900/30 text-cyan-400 border-l-4 border-cyan-400"
                    : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
                }`}
              >
                {item.icon}
                <span className="ml-3 whitespace-nowrap">{item.name}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-gray-400 rounded-md hover:bg-gray-800/60 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5 text-cyan-400" />
              <span className="ml-3 whitespace-nowrap">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div
        className={`h-screen overflow-y-auto transition-all duration-300 ease-in-out ${
          sidebarOpen ? "lg:ml-64" : "ml-0"
        }`}
      >
        <main className="p-4 md:p-6 pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}