import { Link, useNavigate } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import FloatingWhatsApp from './FloatingWhatsApp';
import { SiFacebook, SiInstagram } from 'react-icons/si';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/' });
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/collection', label: 'Collection' },
    { to: '/customize', label: 'Customize' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-primary tracking-tight">
                WoodworkbyTanishas
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-base font-medium text-foreground/80 hover:text-primary transition-colors duration-200"
                  activeProps={{ className: 'text-primary font-semibold' }}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link
                  to="/admin"
                  className="text-base font-medium text-foreground/80 hover:text-primary transition-colors duration-200"
                  activeProps={{ className: 'text-primary font-semibold' }}
                >
                  Admin
                </Link>
              )}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm"
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-6 border-t border-border">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                    activeProps={{ className: 'text-primary font-semibold' }}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                    activeProps={{ className: 'text-primary font-semibold' }}
                  >
                    Admin
                  </Link>
                )}
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-left text-lg font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                  >
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-4">WoodworkbyTanishas</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Crafting timeless furniture pieces from premium Mango and Acacia wood. Each piece tells a story of
                craftsmanship and dedication.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-muted-foreground hover:text-primary transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Connect With Us</h4>
              <div className="space-y-3">
                <a
                  href="https://wa.me/919828288383"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors text-sm block"
                >
                  WhatsApp: +91 9828288383
                </a>
                <div className="flex space-x-4 pt-2">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Facebook"
                  >
                    <SiFacebook size={20} />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label="Instagram"
                  >
                    <SiInstagram size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WoodworkbyTanishas. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'woodworkbytanishas'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <FloatingWhatsApp />
    </div>
  );
}
