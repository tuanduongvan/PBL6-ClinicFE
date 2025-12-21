'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, X, LogOut, Settings, Calendar, FileText, Moon, Sun, Sparkles } from "lucide-react"
import { NotificationCenter } from "@/components/notification-center"
import { useTheme } from "next-themes"
import { User } from "@/types/auth"

interface HeaderProps {
  isLoggedIn: boolean
  user?: User | null
  onLogout?: () => void
  onSignIn?: () => void
  onSignUp?: () => void
  hideMenu?: boolean
}

export function Header({ isLoggedIn, user, onLogout, onSignIn, onSignUp, hideMenu = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []); 

  const closeMenu = () => setIsMenuOpen(false);

  const handleProfileClick = () => {
    if (user?.role?.id === 3) {
      router.push("/patient/profile");
    } else if (user?.role?.id === 2) {
      router.push("/doctor/profile");
    }
  };

  const handleAppointmentsClick = () => {
    if (user?.role?.id === 3) {
      router.push("/patient/my-appointments");
    }
  };

  const handleMedicalHistoryClick = () => {
    if (user?.role?.id === 3) {
      router.push("/patient/medical-history");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link 
            href="/" 
            className="flex items-center gap-3 flex-shrink-0 group transition-opacity hover:opacity-80"
          >
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-primary-foreground font-bold text-lg lg:text-xl">DC</span>
            </div>
            <span className="hidden sm:inline font-semibold text-lg lg:text-xl text-foreground tracking-tight">
              Derma Clinic
            </span>
          </Link>

          {!hideMenu && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link 
                href="/" 
                className="px-3 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                Home
              </Link>
              <Link 
                href="/doctors" 
                className="px-3 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                Our Doctors
              </Link>
              <Link 
                href="/services" 
                className="px-3 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                Services
              </Link>
              {isLoggedIn && user?.role?.id === 3 && (
                <Link 
                  href="/patient/skin-analysis" 
                  className="px-3 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  Skin Analysis
                </Link>
              )}
              <Link 
                href="/about" 
                className="px-3 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="px-3 py-2 text-sm lg:text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
              >
                Contact
              </Link>
            </nav>
          )}

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {!isLoggedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={onSignIn} 
                  className="text-sm lg:text-base font-medium"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={onSignUp} 
                  className="text-sm lg:text-base font-medium shadow-md hover:shadow-lg transition-shadow"
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {isLoggedIn && user?.id && <NotificationCenter userId={user.id} />}
                
                {mounted && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="relative hover:bg-secondary/50"
                  >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                      <AvatarImage 
                        src={user?.avatar || "/placeholder-user.jpg"} 
                        alt={`${user?.first_name} ${user?.last_name}`} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user?.first_name?.charAt(0) || ''}
                        {user?.last_name?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="font-semibold text-foreground">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                      <p className="text-xs text-primary capitalize mt-1 font-medium">
                        {user?.role?.name}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    
                    {(user?.role?.id === 3 || user?.role?.id === 2) && (
                      <DropdownMenuItem 
                        className="cursor-pointer focus:bg-secondary/50" 
                        onClick={handleProfileClick}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        My Profile
                      </DropdownMenuItem>
                    )}
                    
                    {user?.role?.id === 3 && (
                      <>
                        <DropdownMenuItem 
                          className="cursor-pointer focus:bg-secondary/50" 
                          onClick={handleAppointmentsClick}
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          My Appointments
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer focus:bg-secondary/50" 
                          onClick={handleMedicalHistoryClick}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Medical History
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer focus:bg-secondary/50" 
                          onClick={() => router.push('/patient/skin-analysis')}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Skin Analysis
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" 
                      onClick={onLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-secondary/50 transition-colors" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && !hideMenu && (
          <div className="md:hidden pb-4 pt-4 space-y-1 border-t border-border/50 animate-fade-in">
            <Link 
              href="/" 
              onClick={closeMenu} 
              className="block px-4 py-2.5 hover:bg-secondary/50 rounded-lg transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              href="/doctors" 
              onClick={closeMenu} 
              className="block px-4 py-2.5 hover:bg-secondary/50 rounded-lg transition-colors font-medium"
            >
              Our Doctors
            </Link>
            <Link 
              href="/services" 
              onClick={closeMenu} 
              className="block px-4 py-2.5 hover:bg-secondary/50 rounded-lg transition-colors font-medium"
            >
              Services
            </Link>
            {isLoggedIn && user?.role?.id === 3 && (
              <Link 
                href="/patient/skin-analysis" 
                onClick={closeMenu} 
                className="block px-4 py-2.5 hover:bg-secondary/50 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Skin Analysis
              </Link>
            )}
            <Link 
              href="/about" 
              onClick={closeMenu} 
              className="block px-4 py-2.5 hover:bg-secondary/50 rounded-lg transition-colors font-medium"
            >
              About
            </Link>
            <Link 
              href="/faq" 
              onClick={closeMenu} 
              className="block px-4 py-2.5 hover:bg-secondary/50 rounded-lg transition-colors font-medium"
            >
              FAQ
            </Link>
            <Link 
              href="/contact" 
              onClick={closeMenu} 
              className="block px-4 py-2.5 hover:bg-secondary/50 rounded-lg transition-colors font-medium"
            >
              Contact
            </Link>
            <div className="pt-4 flex gap-2 border-t border-border/50">
              {!isLoggedIn ? (
                <>
                  <Button variant="ghost" onClick={onSignIn} className="flex-1">
                    Sign In
                  </Button>
                  <Button onClick={onSignUp} className="flex-1">
                    Sign Up
                  </Button>
                </>
              ) : (
                <Button onClick={onLogout} className="w-full" variant="outline">
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}