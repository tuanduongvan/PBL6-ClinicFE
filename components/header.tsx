'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from 'next/navigation'; 
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, X, LogOut, Settings, Bell, Calendar } from "lucide-react";

interface HeaderProps {
  isLoggedIn: boolean;
  user?: any; 
  onLogout?: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
  hideMenu?: boolean;
}

export function Header({ isLoggedIn, user, onLogout, onSignIn, onSignUp, hideMenu = false }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter(); 

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

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">DC</span>
            </div>
            <span className="hidden sm:inline font-semibold text-lg text-foreground">Derma Clinic</span>
          </Link>

          {!hideMenu && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-foreground hover:text-primary transition">
                Home
              </Link>
              <Link href="/doctors" className="text-foreground hover:text-primary transition">
                Our Doctors
              </Link>
              <Link href="/services" className="text-foreground hover:text-primary transition">
                Services
              </Link>
              <Link href="/contact" className="text-foreground hover:text-primary transition">
                Contact
              </Link>
            </nav>
          )}

          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Button variant="ghost" onClick={onSignIn} className="text-foreground hover:bg-secondary">
                  Sign In
                </Button>
                <Button onClick={onSignUp} className="bg-primary hover:bg-primary/90">
                  Sign Up
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <button className="relative p-2 hover:bg-secondary rounded-lg transition">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer hover:opacity-80 transition">
                      <AvatarImage src={user?.avatar || "https://i.pinimg.com/736x/8f/1c/a2/8f1ca2029e2efceebd22fa05cca423d7.jpg"} alt={user?.first_name} />
                      <AvatarFallback>
                        {user?.first_name?.charAt(0)}
                        {user?.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="font-semibold text-foreground">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-primary capitalize mt-1">Role: {user?.role?.name}</p>
                    </div>
                    <DropdownMenuSeparator />
                    
                    {(user?.role?.id === 3 || user?.role?.id === 2) && (
                      <DropdownMenuItem className="cursor-pointer" onClick={handleProfileClick}>
                        <Settings className="w-4 h-4 mr-2" />
                        My Profile
                      </DropdownMenuItem>
                    )}
                    
                    {user?.role?.id === 3 && (
                      <DropdownMenuItem className="cursor-pointer" onClick={handleAppointmentsClick}>
                        <Calendar className="w-4 h-4 mr-2" />
                        My Appointments
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer text-destructive" onClick={onLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && !hideMenu && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" onClick={closeMenu} className="block px-4 py-2 hover:bg-secondary rounded-lg">
              Home
            </Link>
            <Link href="/doctors" onClick={closeMenu} className="block px-4 py-2 hover:bg-secondary rounded-lg">
              Our Doctors
            </Link>
            <Link href="/services" onClick={closeMenu} className="block px-4 py-2 hover:bg-secondary rounded-lg">
              Services
            </Link>
            <Link href="/contact" onClick={closeMenu} className="block px-4 py-2 hover:bg-secondary rounded-lg">
              Contact
            </Link>
            <div className="pt-2 flex gap-2">
              {!isLoggedIn ? (
                <>
                  <Button variant="ghost" onClick={onSignIn} className="flex-1">
                    Sign In
                  </Button>
                  <Button onClick={onSignUp} className="flex-1 bg-primary">
                    Sign Up
                  </Button>
                </>
              ) : (
                <Button onClick={onLogout} className="w-full bg-transparent" variant="outline">
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