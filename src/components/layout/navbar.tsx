'use client';
// PATH: src/components/layout/navbar.tsx
// Header matching the Va Travel reference design: logo, notifications bell,
// language switcher, Pi Network pill, dark/light toggle. Uses the shared
// `.hdr` / `.pill` / `.notif-*` / `.lang-*` / `.tgl` classes from
// src/app/globals.css so it always stays visually in sync with the rest
// of the app's design tokens (colors, spacing, radii, fonts).

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { t } from '@/lib/i18n/translations';
import { usePi } from '@/components/providers/pi-provider';

const LANGS: Array<{ code: string; flag: string; label: string }> = [
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'fr', flag: '🇫🇷', label: 'Français' },
  { code: 'es', flag: '🇪🇸', label: 'Español' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
  { code: 'zh', flag: '🇨🇳', label: '中文' },
  { code: 'ja', flag: '🇯🇵', label: '日本語' },
  { code: 'ru', flag: '🇷🇺', label: 'Русский' },
];

// TODO: replace with real data once a notifications API/table exists.
// Kept intentionally small and generic — this is placeholder content so
// the bell + panel are functional and visually correct in the meantime.
function usePlaceholderNotifications(tr: ReturnType<typeof t>) {
  return [
    { id: 1, icon: '🎁', title: tr.header.subtitle, body: tr.ticker[4]?.replace(/\*\*/g, '') ?? '', unread: true },
    { id: 2, icon: '📉', title: tr.ticker[1]?.replace(/\*\*/g, '') ?? '', body: '', unread: true },
    { id: 3, icon: '🌍', title: tr.ticker[5]?.replace(/\*\*/g, '') ?? '', body: '', unread: true },
  ];
}

export function Navbar({ locale }: { locale: string; isRTL?: boolean }) {
  const tr = t(locale);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const pi = usePi();

  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const notifications = usePlaceholderNotifications(tr);
  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;
  const currentLang = LANGS.find(l => l.code === locale) ?? LANGS[1];

  function switchLocale(code: string) {
    if (code === locale) { setLangOpen(false); return; }
    const segments = pathname.split('/');
    segments[1] = code; // segments[0] is '' before the leading slash
    window.location.href = segments.join('/') || `/${code}`;
  }

  function handlePiClick() {
    if (!pi.isAuthenticated) {
      pi.authenticate().catch(() => {
        /* surfaced via toast provider elsewhere; nothing else to do here */
      });
    }
  }

  return (
    <header className="hdr">
      <Link href={`/${locale}`} className="logo">
        <div className="logo-mark">✦</div>
        <div>
          <div className="logo-text">Va Travel</div>
          <span className="logo-sub">{tr.header.subtitle}</span>
        </div>
      </Link>

      <div className="hdr-r">
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="notif-btn"
            onClick={() => { setNotifOpen(v => !v); setLangOpen(false); }}
            aria-label={tr.header.notifTitle}
            aria-expanded={notifOpen}
          >
            🔔
            <div className={`notif-badge${unreadCount === 0 ? ' hidden' : ''}`}>{unreadCount}</div>
          </button>

          {notifOpen && (
            <div className="notif-panel on">
              <div className="notif-hdr">
                <div className="notif-hdr-title">{tr.header.notifTitle}</div>
                <div className="notif-mark" onClick={() => setNotifOpen(false)}>
                  {tr.header.notifMarkAllRead}
                </div>
              </div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">{tr.header.notifEmpty}</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item${n.unread ? ' unread' : ''}`}>
                      <div className="notif-ico">{n.icon}</div>
                      <div>
                        <div className="notif-title">{n.title}</div>
                        {n.body && <div className="notif-body">{n.body}</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            className="pill"
            onClick={() => { setLangOpen(v => !v); setNotifOpen(false); }}
            aria-expanded={langOpen}
          >
            🌐 {currentLang.label}
          </button>

          {langOpen && (
            <div className="lang-panel on">
              {LANGS.map(l => (
                <div
                  key={l.code}
                  className={`lang-opt${l.code === locale ? ' on' : ''}`}
                  onClick={() => switchLocale(l.code)}
                >
                  {l.flag} {l.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="pill" onClick={handlePiClick}>
          π {pi.isAuthenticated && pi.user ? `@${pi.user.username}` : tr.header.piNetwork}
        </button>

        <div
          className="tgl"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          role="button"
          aria-label="Toggle dark / light mode"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setTheme(isDark ? 'light' : 'dark'); }}
        />
      </div>
    </header>
  );
}
