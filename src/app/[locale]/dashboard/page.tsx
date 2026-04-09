'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Calendar, MapPin, Star, Wallet, Heart,
  Clock, CheckCircle, AlertCircle, ArrowRight, Pi, TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { locale } = useParams();
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [userRes, bookingsRes] = await Promise.all([
          fetch('/api/user'),
          fetch('/api/bookings?limit=5'),
        ]);
        const user = await userRes.json();
        const bookingsData = await bookingsRes.json();
        setUserData(user);
        setRecentBookings(bookingsData.bookings || []);
        setStats({
          totalBookings: user._count?.bookings || 0,
          totalReviews: user._count?.reviews || 0,
          favorites: user._count?.favorites || 0,
          piBalance: user.piBalance || 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--vg-bg)' }}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const name = userData?.name || session?.user?.name || 'Traveler';
  const initial = name.charAt(0).toUpperCase();

  const statCards = [
    { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: Calendar, suffix: '' },
    { label: 'Reviews Written', value: stats?.totalReviews || 0, icon: Star, suffix: '' },
    { label: 'Saved Places', value: stats?.favorites || 0, icon: Heart, suffix: '' },
    { label: 'Pi Balance', value: stats?.piBalance?.toFixed(2) || '0.00', icon: Pi, suffix: 'π', gold: true },
  ];

  const quickActions = [
    { href: `/${locale}/hotels`, icon: MapPin, label: 'Find Hotels' },
    { href: `/${locale}/attractions`, icon: Star, label: 'Attractions' },
    { href: `/${locale}/bookings`, icon: Calendar, label: 'My Bookings' },
    { href: `/${locale}/ai`, icon: TrendingUp, label: 'AI Assistant' },
    { href: `/${locale}/wallet`, icon: Wallet, label: 'Pi Wallet', gold: true },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '64px' }}>

      {/* Header */}
      <div style={{
        background: 'var(--vg-bg-surface)',
        borderBottom: '1px solid var(--vg-border)',
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 7vw, 5rem)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {/* Avatar */}
          <div style={{
            width: '60px',
            height: '60px',
            background: 'var(--vg-gold-dim)',
            border: '1px solid var(--vg-gold-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-cormorant)',
            fontSize: '1.6rem',
            fontWeight: 300,
            color: 'var(--vg-gold)',
            flexShrink: 0,
          }}>
            {initial}
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-space-mono)',
              fontSize: '0.44rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--vg-gold)',
              marginBottom: '0.4rem',
            }}>Welcome back</div>
            <h1 style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 300,
              color: 'var(--vg-text)',
              lineHeight: 0.95,
              margin: 0,
            }}>
              {name}
            </h1>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2.5rem clamp(1.5rem, 7vw, 5rem)',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
      }}>

        {/* Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1px',
          background: 'var(--vg-border)',
        }}>
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} style={{
                background: card.gold ? 'linear-gradient(135deg, var(--vg-gold-dim2), var(--vg-gold-dim))' : 'var(--vg-bg-card)',
                padding: '1.75rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: 'var(--font-space-mono)',
                    fontSize: '0.43rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: card.gold ? 'var(--vg-gold)' : 'var(--vg-text-3)',
                  }}>
                    {card.label}
                  </span>
                  <Icon size={14} color={card.gold ? 'var(--vg-gold)' : 'var(--vg-text-3)'} />
                </div>
                <div style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '2.4rem',
                  fontWeight: 300,
                  color: card.gold ? 'var(--vg-gold)' : 'var(--vg-text)',
                  lineHeight: 1,
                }}>
                  {card.suffix && <span style={{ fontSize: '1.2rem', marginRight: '0.2rem' }}>{card.suffix}</span>}
                  {card.value}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main + Sidebar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: '2rem',
        }}>

          {/* Recent Bookings */}
          <div style={{
            background: 'var(--vg-bg-card)',
            border: '1px solid var(--vg-border)',
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--vg-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-cormorant)',
                  fontSize: '1.3rem',
                  fontWeight: 300,
                  color: 'var(--vg-text)',
                  margin: 0,
                }}>Recent Bookings</h2>
              </div>
              <Link href={`/${locale}/bookings`} style={{
                fontFamily: 'var(--font-space-mono)',
                fontSize: '0.43rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'var(--vg-gold)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}>
                View All <ArrowRight size={11} />
              </Link>
            </div>

            <div>
              {recentBookings.length === 0 ? (
                <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                  <Calendar size={28} color="var(--vg-text-3)" style={{ marginBottom: '0.75rem' }} />
                  <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.2rem', fontWeight: 300, color: 'var(--vg-text-2)', marginBottom: '0.4rem' }}>
                    No bookings yet
                  </p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)', marginBottom: '1.25rem' }}>
                    Start planning your next journey
                  </p>
                  <Link href={`/${locale}/hotels`} className="vg-btn-primary" style={{ textDecoration: 'none', fontSize: '0.46rem' }}>
                    Explore Hotels
                  </Link>
                </div>
              ) : (
                recentBookings.map((booking, idx) => (
                  <BookingRow key={booking.id} booking={booking} isLast={idx === recentBookings.length - 1} />
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'var(--vg-bg-card)',
            border: '1px solid var(--vg-border)',
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--vg-border)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: '1.3rem',
                fontWeight: 300,
                color: 'var(--vg-text)',
                margin: 0,
              }}>Quick Actions</h2>
            </div>

            <div>
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    style={{ textDecoration: 'none', display: 'block' }}
                  >
                    <QuickActionRow
                      icon={Icon}
                      label={action.label}
                      gold={action.gold}
                      isLast={idx === quickActions.length - 1}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingRow({ booking, isLast }: { booking: any; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);
  const statusColor = booking.status === 'confirmed' ? 'var(--vg-gold)' :
    booking.status === 'pending' ? '#6b9fff' : 'var(--vg-text-3)';
  const StatusIcon = booking.status === 'confirmed' ? CheckCircle :
    booking.status === 'pending' ? Clock : AlertCircle;

  return (
    <div
      style={{
        padding: '1rem 1.5rem',
        borderBottom: isLast ? 'none' : '1px solid var(--vg-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        background: hovered ? 'var(--vg-gold-dim2)' : 'transparent',
        transition: 'background 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: '32px',
        height: '32px',
        border: `1px solid ${statusColor}30`,
        background: `${statusColor}10`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <StatusIcon size={14} color={statusColor} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: '0.88rem',
          color: 'var(--vg-text)',
          fontWeight: 500,
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>{booking.itemName}</p>
        <p style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '0.42rem',
          letterSpacing: '0.12em',
          color: 'var(--vg-text-3)',
          margin: '0.2rem 0 0',
          textTransform: 'uppercase',
        }}>
          {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <p style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: '1.1rem',
          fontWeight: 300,
          color: 'var(--vg-text)',
          margin: 0,
        }}>
          {formatCurrency(booking.totalPrice, booking.currency)}
        </p>
        <p style={{
          fontFamily: 'var(--font-space-mono)',
          fontSize: '0.4rem',
          letterSpacing: '0.12em',
          color: statusColor,
          margin: '0.2rem 0 0',
          textTransform: 'uppercase',
        }}>
          {booking.status}
        </p>
      </div>
    </div>
  );
}

function QuickActionRow({ icon: Icon, label, gold, isLast }: { icon: any; label: string; gold?: boolean; isLast: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        padding: '0.9rem 1.5rem',
        borderBottom: isLast ? 'none' : '1px solid var(--vg-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        background: hovered ? (gold ? 'var(--vg-gold-dim)' : 'var(--vg-gold-dim2)') : 'transparent',
        transition: 'background 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: '30px',
        height: '30px',
        border: `1px solid ${gold ? 'var(--vg-gold-border)' : 'var(--vg-border)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={13} color={gold ? 'var(--vg-gold)' : 'var(--vg-text-2)'} />
      </div>
      <span style={{
        fontFamily: 'var(--font-dm-sans)',
        fontSize: '0.88rem',
        color: gold ? 'var(--vg-gold)' : 'var(--vg-text-2)',
        flex: 1,
      }}>{label}</span>
      <ArrowRight size={12} color={hovered ? (gold ? 'var(--vg-gold)' : 'var(--vg-text-2)') : 'var(--vg-text-3)'} />
    </div>
  );
}
