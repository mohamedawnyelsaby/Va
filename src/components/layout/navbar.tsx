'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Menu, X, Search, Globe, Moon, Sun,
  User, Settings, LogOut, Calendar, Heart, Pi,
  Hotel, Map, UtensilsCrossed, Building2, Sparkles
} from 'lucide-react';

interface NavbarProps {
  locale: string;
  session: any;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'hi', name: 'हिंदी', flag: '🇮🇳' },
];

export function Navbar({ locale, session }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navigation = [
    { name: 'Hotels', href: `/${locale}/hotels`, icon: Hotel },
    { name: 'Attractions', href: `/${locale}/attractions`, icon: Map },
    { name: 'Restaurants', href: `/${locale}/restaurants`, icon: UtensilsCrossed },
    { name: 'Cities', href: `/${locale}/cities`, icon: Building2 },
    { name: 'AI Assistant', href: `/${locale}/ai`, icon: Sparkles },
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#07090F]/95 backdrop-blur-xl dark:bg-[#07090F]/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7C5CFC]">
              <span className="text-sm font-medium text-white">Va</span>
            </div>
            <span className="hidden text-base font-medium text-white sm:inline-block">
              Va Travel
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-1.5 text-sm text-white/45 transition-colors hover:text-white/90"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2">

            {/* Pi Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#EAB308]/10 border border-[#EAB308]/20 text-[#EAB308] text-xs px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-[#EAB308] rounded-full" />
              Pi Network
            </div>

            {/* Search */}
            <Link href={`/${locale}/search`}>
              <Button variant="ghost" size="icon" className="text-white/50 hover:text-white hover:bg-white/5">
                <Search className="h-4 w-4" />
              </Button>
            </Link>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white/50 hover:text-white hover:bg-white/5"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Language */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-white/50 hover:text-white hover:bg-white/5">
                  <Globe className="h-4 w-4" />
                  <span>{currentLanguage.flag}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#0F1120] border-white/10">
                <DropdownMenuLabel className="text-white/50">Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {languages.map((lang) => (
                  <DropdownMenuItem key={lang.code} asChild>
                    <Link href={`/${lang.code}`} className="flex items-center gap-2 text-white/70 hover:text-white">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-white/5">
                    <Avatar className="h-9 w-9 ring-2 ring-[#7C5CFC]/40">
                      <AvatarImage src={session.user.image} alt={session.user.name} />
                      <AvatarFallback className="bg-[#7C5CFC] text-white text-sm">
                        {session.user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-[#0F1120] border-white/10" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-white">{session.user.name}</p>
                      <p className="text-xs text-white/40">{session.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/dashboard`} className="text-white/70 hover:text-white focus:text-white focus:bg-white/5">
                      <User className="mr-2 h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/bookings`} className="text-white/70 hover:text-white focus:text-white focus:bg-white/5">
                      <Calendar className="mr-2 h-4 w-4" /> My Bookings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/favorites`} className="text-white/70 hover:text-white focus:text-white focus:bg-white/5">
                      <Heart className="mr-2 h-4 w-4" /> Favorites
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/settings`} className="text-white/70 hover:text-white focus:text-white focus:bg-white/5">
                      <Settings className="mr-2 h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="bg-[#EAB308]/10 focus:bg-[#EAB308]/15">
                    <Pi className="mr-2 h-4 w-4 text-[#EAB308]" />
                    <span className="text-[#EAB308] font-medium">
                      π {session.user.piBalance?.toFixed(2) || '0.00'}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: `/${locale}` })}
                    className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-400/10"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href={`/${locale}/auth/signin`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/50 hover:text-white border border-white/10 hover:bg-white/5"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href={`/${locale}/auth/signup`}>
                  <Button
                    size="sm"
                    className="bg-[#7C5CFC] hover:bg-[#6D4EE8] text-white border-0"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white/50 hover:text-white hover:bg-white/5"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/5 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-white transition-colors"
                  onClick={closeMenu}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
              {!session?.user && (
                <>
                  <div className="h-px bg-white/5" />
                  <Link href={`/${locale}/auth/signin`} onClick={closeMenu}>
                    <Button variant="outline" className="w-full border-white/10 text-white/70 hover:text-white hover:bg-white/5">
                      Sign In
                    </Button>
                  </Link>
                  <Link href={`/${locale}/auth/signup`} onClick={closeMenu}>
                    <Button className="w-full bg-[#7C5CFC] hover:bg-[#6D4EE8] text-white border-0">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
