import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from 'lucide-react'

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
] as const

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/doctors', label: 'Our Doctors' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About Us' },
] as const

const serviceLinks = [
  { href: '#', label: 'Acne Treatment' },
  { href: '#', label: 'Anti-Aging' },
  { href: '#', label: 'Skin Surgery' },
  { href: '#', label: 'Cosmetic Procedures' },
] as const

export function Footer() {
  return (
    <footer className="relative bg-secondary/30 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* About */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-lg">DC</span>
              </div>
              <span className="font-semibold text-lg text-foreground">Derma Clinic</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Professional dermatology services with expert doctors and modern facilities. 
              Your trusted partner for healthy, beautiful skin.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-base mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-base mb-4">Services</h3>
            <ul className="space-y-3">
              {serviceLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-block hover:translate-x-1 duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-base mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a 
                href="tel:+1-555-0100" 
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <span>+1-555-0100</span>
              </a>
              <a 
                href="mailto:info@dermaclinic.com" 
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <span className="break-all">info@dermaclinic.com</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <span className="leading-relaxed">123 Medical Center, Healthcare City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span>&copy; {new Date().getFullYear()} Derma Clinic. All rights reserved.</span>
              <span className="hidden sm:inline">Made with</span>
              <Heart className="w-4 h-4 text-primary hidden sm:inline" />
            </div>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-4 text-sm">
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-border">•</span>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
