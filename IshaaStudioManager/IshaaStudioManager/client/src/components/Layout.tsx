import { Link, useLocation } from "wouter";
import { useAuthStatus } from "@/hooks/useAdmin";
import { logout } from "@/lib/utils";
import { VideoIcon, LockIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { data: authData, isLoading } = useAuthStatus();

  const isAdmin = authData?.isAuthenticated && authData?.isAdmin;
  const isAdminPage = location.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/">
            <a className="flex items-center space-x-2">
              <VideoIcon className="h-5 w-5" />
              <h1 className="text-xl font-medium">Ishaat Studio Booking Manager</h1>
            </a>
          </Link>
          <div>
            {isLoading ? (
              <div className="w-24 h-9 animate-pulse bg-primary-light rounded"></div>
            ) : isAdmin ? (
              <div className="flex items-center space-x-4">
                {!isAdminPage && (
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-1 hover:bg-primary-dark"
                    asChild
                  >
                    <Link href="/admin/dashboard">
                      <a>Dashboard</a>
                    </Link>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-1 hover:bg-primary-dark"
                  onClick={logout}
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                className="flex items-center space-x-1 hover:bg-primary-dark"
                asChild
              >
                <Link href="/admin/login">
                  <a>
                    <LockIcon className="h-4 w-4" />
                    <span>Admin Login</span>
                  </a>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-neutral-dark text-white py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Ishaat Studio Booking Manager | Internal Use Only</p>
        </div>
      </footer>
    </div>
  );
}
