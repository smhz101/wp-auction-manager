import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import highlightSubmenu from "@/lib/highlightSubmenu";

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navItems = [
    { label: "All Auctions", path: "/all-auctions" },
    { label: "Settings", path: "/settings" },
  ];

  useEffect(() => {
    highlightSubmenu(location.pathname);
  }, [location.pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <nav className="mx-auto flex max-w-6xl gap-4 p-4">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "secondary" : "ghost"}
              asChild
            >
              <Link to={item.path}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </header>
      <main className="flex-1 overflow-y-auto p-4">{children}</main>
    </div>
  );
}
