import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { Sun, Moon, Globe, User, LogOut, Menu, LayoutDashboard, ShieldCheck, Heart, Package, MessageSquare } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const { t, lang, setLang, SUPPORTED_LANGS, LANG_LABELS } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, children, icon: Icon, testId }) => (
    <Link
      to={to}
      data-testid={testId}
      className={`flex items-center gap-2 text-sm transition-colors hover:text-primary ${isActive(to) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
      onClick={() => setMobileOpen(false)}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 glass bg-background/90 border-b border-border/50" data-testid="main-header">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
          <span className="font-special text-lg font-bold text-primary">KAIF</span>
          <span className="text-sm text-muted-foreground hidden sm:block">OZERO</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/catalog" icon={Package} testId="nav-catalog">{t('nav.catalog')}</NavLink>
          {user && (
            <>
              <NavLink to="/dashboard" icon={LayoutDashboard} testId="nav-dashboard">{t('nav.dashboard')}</NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" icon={ShieldCheck} testId="nav-admin">{t('nav.admin')}</NavLink>
              )}
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 px-2" data-testid="lang-switcher">
                <Globe className="h-4 w-4 mr-1" />
                <span className="text-xs uppercase">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SUPPORTED_LANGS.map(l => (
                <DropdownMenuItem key={l} onClick={() => setLang(l)} data-testid={`lang-${l}`}>
                  {LANG_LABELS[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button variant="ghost" size="sm" className="h-9 px-2" onClick={toggleTheme} data-testid="theme-toggle">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-2" data-testid="user-menu-btn">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-6 w-6 rounded-full" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="hidden sm:block text-xs max-w-24 truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="menu-dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" /> {t('nav.dashboard')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard?tab=favorites')} data-testid="menu-favorites">
                  <Heart className="mr-2 h-4 w-4" /> {t('nav.favorites')}
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="menu-admin">
                    <ShieldCheck className="mr-2 h-4 w-4" /> {t('nav.admin')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                  <LogOut className="mr-2 h-4 w-4" /> {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" className="h-9 rounded-full" onClick={() => navigate('/auth')} data-testid="login-btn">
              {t('nav.login')}
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 px-2 md:hidden" data-testid="mobile-menu-btn">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                <NavLink to="/catalog" icon={Package} testId="mobile-nav-catalog">{t('nav.catalog')}</NavLink>
                {user && (
                  <>
                    <NavLink to="/dashboard" icon={LayoutDashboard} testId="mobile-nav-dashboard">{t('nav.dashboard')}</NavLink>
                    {user.role === 'admin' && (
                      <NavLink to="/admin" icon={ShieldCheck} testId="mobile-nav-admin">{t('nav.admin')}</NavLink>
                    )}
                  </>
                )}
                {!user && (
                  <Button className="rounded-full mt-4" onClick={() => { setMobileOpen(false); navigate('/auth'); }} data-testid="mobile-login-btn">
                    {t('nav.login')}
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
