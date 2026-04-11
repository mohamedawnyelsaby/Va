'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, MapPin, Star, TrendingUp, Heart, Clock, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { useParams } from 'next/navigation';

function StatCard({ num, label, icon: Icon, accent = false }: { num: any, label: string, icon: any, accent?: boolean }) {
  return (
    <div style={{
      background: accent ? 'var(--vg-gold-dim)' : 'var(--vg-bg-card)',
      border: `1px solid ${accent ? 'var(--vg-gold-border)' : 'var(--vg-border)'}`,
      padding: '1.5rem',
      transition: 'transform 0.2s, border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--vg-text-3)' }}>{label}</span>
        <div style={{ width: '32px', height: '32px', border: '1px solid var(--vg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent ? 'var(--vg-gold)' : 'var(--vg-text-3)' }}>
          <Icon size={13} />
        </div>
      </div>
      <div className="vg-stat-num" style={{ fontSize: '2.2rem' }}>{num}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [userData, setUserData] = useState<any>(null);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, bookingsRes] = await Promise.all([fetch('/api/user'), fetch('/api/bookings?limit=5')]);
        const user = await userRes.json();
        const bookingsData = await bookingsRes.json();
        setUserData(user);
        setRecentBookings(bookingsData.bookings || []);
      } catch { } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '1px solid var(--vg-gold-border)', borderTop: '1px solid var(--vg-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.48rem', letterSpacing: '0.3em', color: 'var(--vg-text-3)', textTransform: 'uppercase' }}>Loading Dashboard</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const name = userData?.name || session?.user?.name || 'Traveler';
  const initial = name.charAt(0).toUpperCase();
  const stats = {
    bookings: userData?._count?.bookings ?? 0,
    reviews: userData?._count?.reviews ?? 0,
    favorites: userData?._count?.favorites ?? 0,
    piBalance: userData?.piBalance ?? 0,
  };

  const QUICK_LINKS = [
    { href: `/${locale}/hotels`, label: 'Find Hotels', icon: MapPin },
    { href: `/${locale}/attractions`, label: 'Attractions', icon: Star },
    { href: `/${locale}/restaurants`, label: 'Restaurants', icon: TrendingUp },
    { href: `/${locale}/bookings`, label: 'My Bookings', icon: Calendar },
  ];

  const statusConfig: Record<string, { color: string; icon: any }> = {
    confirmed: { color: '#10b981', icon: CheckCircle },
    pending:   { color: 'var(--vg-gold)', icon: Clock },
    cancelled: { color: '#ef4444', icon: AlertCircle },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Header */}
      <div style={{
        background: 'var(--vg-bg-surface)',
        borderBottom: '1px solid var(--vg-border)',
        padding: 'clamp(2.5rem,5vw,4rem) clamp(1.5rem,7vw,5rem)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '100%', background: 'radial-gradient(ellipse at right, rgba(201,162,39,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '60px', height: '60px', background: 'var(--vg-gold-dim)',
            border: '1px solid var(--vg-gold-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--vg-gold)',
          }}>
            {initial}
          </div>
          <div>
            <div className="vg-overline" style={{ marginBottom: '0.4rem' }}>Dashboard</div>
            <h1 className="vg-display" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)' }}>
              Welcome, <em className="vg-italic">{name}</em>
            </h1>
          </div>
        </div>
      </div>

      <div style={{ padding: '2.5rem clamp(1.5rem,7vw,5rem)', maxWidth: '1400px', margin: '0 auto' }}>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', background: 'var(--vg-border)', marginBottom: '2.5rem' }}>
          <StatCard num={stats.bookings} label="Total Bookings" icon={Calendar} />
          <StatCard num={stats.reviews} label="Reviews Written" icon={Star} />
          <StatCard num={stats.favorites} label="Saved Places" icon={Heart} />
          <StatCard num={`π ${stats.piBalance.toFixed(2)}`} label="Pi Balance" icon={TrendingUp} accent />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: '1px', background: 'var(--vg-border)' }}
          className="dash-grid">
          <style>{`@media(max-width:800px){.dash-grid{grid-template-columns:1fr!important}}`}</style>

          {/* Recent Bookings */}
          <div style={{ background: 'var(--vg-bg-card)', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="vg-overline">Recent Bookings</div>
              <Link href={`/${locale}/bookings`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--vg-gold)' }}>
                View All <ArrowRight size={11} />
              </Link>
            </div>

            {recentBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem', color: 'var(--vg-text-3)', marginBottom: '0.8rem' }}>No Bookings Yet</div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.82rem', color: 'var(--vg-text-3)', marginBottom: '1.5rem' }}>Start exploring and book your first trip.</p>
                <Link href={`/${locale}/hotels`} className="vg-btn-primary" style={{ textDecoration: 'none' }}>Explore Hotels</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)' }}>
                {recentBookings.map((booking) => {
                  const cfg = statusConfig[booking.status] || statusConfig.pending;
                  const StatusIcon = cfg.icon;
                  return (
                    <div key={booking.id} style={{
                      background: 'var(--vg-bg-surface)', padding: '1rem 1.2rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'background 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-gold-dim2)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-bg-surface)'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${cfg.color}22`, background: `${cfg.color}11` }}>
                          <StatusIcon size={14} style={{ color: cfg.color }} />
                        </div>
                        <div>
                          <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.86rem', color: 'var(--vg-text)', marginBottom: '0.2rem' }}>{booking.itemName}</div>
                          <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.12em', color: 'var(--vg-text-3)' }}>
                            {new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.7rem', color: 'var(--vg-gold)' }}>
                          {formatCurrency(booking.totalPrice, booking.currency)}
                        </div>
                        <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.42rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: cfg.color, marginTop: '0.2rem' }}>
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'var(--vg-bg-card)', padding: '2rem' }}>
            <div className="vg-overline" style={{ marginBottom: '1.5rem' }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--vg-border)', marginBottom: '1.5rem' }}>
              {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div className="vg-pi-step"
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-gold-dim2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--vg-bg-card)'}>
                    <div className="vg-feat-icon" style={{ minWidth: '32px', width: '32px', height: '32px' }}>
                      <Icon size={12} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)' }}>{label}</span>
                    <ArrowRight size={12} style={{ marginLeft: 'auto', color: 'var(--vg-text-3)' }} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pi Wallet card */}
            <div style={{ background: 'var(--vg-gold-dim)', border: '1px solid var(--vg-gold-border)', padding: '1.2rem' }}>
              <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.44rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--vg-gold)', marginBottom: '0.6rem' }}>Pi Wallet</div>
              <div className="vg-stat-num" style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>π {stats.piBalance.toFixed(2)}</div>
              <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.74rem', color: 'var(--vg-text-3)', marginBottom: '1rem' }}>Available to spend</div>
              <Link href={`/${locale}/wallet`} className="vg-btn-primary" style={{ textDecoration: 'none', fontSize: '0.44rem', padding: '0.65rem 1.2rem', display: 'inline-flex' }}>
                Top Up Wallet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
