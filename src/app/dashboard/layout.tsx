"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Loading from "@/components/Loading";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const session = useSession();
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  if (session?.status === "loading") {
    return <Loading text="Loading..." fullScreen className="min-h-screen" />;
  }
  const role = (session.data?.user as any).role as string;

  const navLinks = [
    { href: "/dashboard/requests", label: "Requests" },
    ...(role === "teacher" ? [{ href: "/dashboard/new-request", label: "New Request" }] : []),
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[240px_1fr]">
      {/* Mobile Header */}
      <header className="lg:hidden border-b bg-zinc-50 p-4 flex items-center justify-between">
        <div>
          <div className="font-semibold">{session.data?.user?.name}</div>
          <div className="text-sm text-zinc-600 capitalize">{role}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <aside className="lg:hidden border-b bg-zinc-50 p-4 space-y-2">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className={`block px-2 py-1 rounded hover:bg-zinc-100 ${pathname.includes(link.href) && "shadow "}`}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block border-r bg-zinc-50 p-4 space-y-2">
        <div className="font-bold text-2xl truncate">{session.data?.user?.name}</div>
        <div className=" text-white font-bold text-lg capitalize border w-fit  px-4 py-2 rounded-br-full bg-indigo-400">{role}</div>
        <nav className="pt-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              className={`block p-2 text-md rounded hover:bg-zinc-100 ${pathname.includes(link.href) && "shadow bg-gray-200"}`}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="p-4 lg:p-6 flex-1 overflow-auto">{children}</main>
    </div>
  );
}


