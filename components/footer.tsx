'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">DC</span>
              </div>
              <span className="font-semibold text-foreground">Derma Clinic</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Professional dermatology services with expert doctors and modern facilities.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-muted-foreground hover:text-primary transition">Home</Link></li>
              <li><Link href="/doctors" className="text-sm text-muted-foreground hover:text-primary transition">Our Doctors</Link></li>
              <li><Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition">Services</Link></li>
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition">About Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Services</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition">Acne Treatment</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition">Anti-Aging</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition">Skin Surgery</Link></li>
              <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary transition">Cosmetic</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact Us</h3>
            <div className="space-y-3">
              <a href="tel:+1-555-0100" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
                <Phone className="w-4 h-4" />
                +1-555-0100
              </a>
              <a href="mailto:info@dermaclinic.com" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition">
                <Mail className="w-4 h-4" />
                info@dermaclinic.com
              </a>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>123 Medical Center, Healthcare City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              &copy; 2025 Derma Clinic. All rights reserved.
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-4 text-sm">
              <Link href="#" className="text-muted-foreground hover:text-primary transition">Privacy</Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
