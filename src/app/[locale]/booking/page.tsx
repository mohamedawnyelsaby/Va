'use client';
// PATH: src/app/[locale]/booking/page.tsx
// Checkout page. The SERVER computes the price; this page only shows what it returns.
//  - every label in the visitor's language (8 languages) and dates formatted for that locale
//  - the stay is validated before anything is created (no more "Invalid time value" errors)
//  - the booking is created once per visit (React re-renders / strict mode no longer create duplicates)
//  - the service fee is derived from the server's total, so the lines always add up to the total
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MapPin, AlertCircle, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatPi } from '@/lib/utils';
import { parseStayParams } from '@/lib/stay';
import PaymentFlow from '@/app/components/PaymentFlow';
import Link from 'next/link';
import type { Booking, BookingHotelSummary } from '@/types/booking';

interface Words {
  back: string; secure: string; titleA: string; titleB: string; summary: string;
  checkIn: string; checkOut: string; duration: string; guests: string; rooms: string; roomType: string;
  service: string; total: string; bookingId: string; preparing: string; errorTitle: string;
  backToHotels: string; missing: string; failed: string;
  nights: (n: number) => string; guestsN: (n: number) => string; roomsN: (n: number) => string;
}

const WORDS: Record<string, Words> = {
  en: { back: 'Back to Hotel', secure: 'Secure Checkout', titleA: 'Complete Your', titleB: 'Booking', summary: 'Booking Summary',
    checkIn: 'Check-in', checkOut: 'Check-out', duration: 'Duration', guests: 'Guests', rooms: 'Rooms', roomType: 'Room Type',
    service: 'Service fee', total: 'Total', bookingId: 'Booking ID', preparing: 'Preparing Your Booking', errorTitle: 'Booking Error',
    backToHotels: 'Back to Hotels', missing: 'Missing or invalid booking details. Please go back and choose your dates.', failed: 'Failed to initialize booking',
    nights: (n) => `${n} night${n !== 1 ? 's' : ''}`, guestsN: (n) => `${n} guest${n !== 1 ? 's' : ''}`, roomsN: (n) => `${n} room${n !== 1 ? 's' : ''}` },
  ar: { back: 'العودة إلى الفندق', secure: 'دفع آمن', titleA: 'أكمل', titleB: 'حجزك', summary: 'ملخص الحجز',
    checkIn: 'الوصول', checkOut: 'المغادرة', duration: 'المدة', guests: 'الضيوف', rooms: 'الغرف', roomType: 'نوع الغرفة',
    service: 'رسوم الخدمة', total: 'الإجمالي', bookingId: 'رقم الحجز', preparing: 'جارٍ تجهيز حجزك', errorTitle: 'خطأ في الحجز',
    backToHotels: 'العودة إلى الفنادق', missing: 'بيانات الحجز ناقصة أو غير صحيحة. ارجع واختر التواريخ.', failed: 'تعذر تجهيز الحجز',
    nights: (n) => `${n} ليلة`, guestsN: (n) => `${n} ضيف`, roomsN: (n) => `${n} غرفة` },
  fr: { back: 'Retour à l’hôtel', secure: 'Paiement sécurisé', titleA: 'Finalisez votre', titleB: 'réservation', summary: 'Récapitulatif',
    checkIn: 'Arrivée', checkOut: 'Départ', duration: 'Durée', guests: 'Voyageurs', rooms: 'Chambres', roomType: 'Type de chambre',
    service: 'Frais de service', total: 'Total', bookingId: 'N° de réservation', preparing: 'Préparation de votre réservation', errorTitle: 'Erreur de réservation',
    backToHotels: 'Retour aux hôtels', missing: 'Informations de réservation manquantes ou invalides. Revenez en arrière et choisissez vos dates.', failed: 'Impossible de préparer la réservation',
    nights: (n) => `${n} nuit${n > 1 ? 's' : ''}`, guestsN: (n) => `${n} voyageur${n > 1 ? 's' : ''}`, roomsN: (n) => `${n} chambre${n > 1 ? 's' : ''}` },
  es: { back: 'Volver al hotel', secure: 'Pago seguro', titleA: 'Completa tu', titleB: 'reserva', summary: 'Resumen de la reserva',
    checkIn: 'Entrada', checkOut: 'Salida', duration: 'Duración', guests: 'Huéspedes', rooms: 'Habitaciones', roomType: 'Tipo de habitación',
    service: 'Tarifa de servicio', total: 'Total', bookingId: 'ID de reserva', preparing: 'Preparando tu reserva', errorTitle: 'Error de reserva',
    backToHotels: 'Volver a hoteles', missing: 'Faltan datos de la reserva o no son válidos. Vuelve y elige tus fechas.', failed: 'No se pudo preparar la reserva',
    nights: (n) => `${n} noche${n !== 1 ? 's' : ''}`, guestsN: (n) => `${n} huésped${n !== 1 ? 'es' : ''}`, roomsN: (n) => `${n} habitación${n !== 1 ? 'es' : ''}` },
  de: { back: 'Zurück zum Hotel', secure: 'Sichere Zahlung', titleA: 'Schließe deine', titleB: 'Buchung ab', summary: 'Buchungsübersicht',
    checkIn: 'Anreise', checkOut: 'Abreise', duration: 'Dauer', guests: 'Gäste', rooms: 'Zimmer', roomType: 'Zimmertyp',
    service: 'Servicegebühr', total: 'Gesamt', bookingId: 'Buchungs-ID', preparing: 'Buchung wird vorbereitet', errorTitle: 'Buchungsfehler',
    backToHotels: 'Zurück zu den Hotels', missing: 'Buchungsdaten fehlen oder sind ungültig. Gehe zurück und wähle deine Reisedaten.', failed: 'Buchung konnte nicht vorbereitet werden',
    nights: (n) => `${n} ${n === 1 ? 'Nacht' : 'Nächte'}`, guestsN: (n) => `${n} ${n === 1 ? 'Gast' : 'Gäste'}`, roomsN: (n) => `${n} Zimmer` },
  ru: { back: 'Назад к отелю', secure: 'Безопасная оплата', titleA: 'Завершите', titleB: 'бронирование', summary: 'Детали бронирования',
    checkIn: 'Заезд', checkOut: 'Выезд', duration: 'Срок', guests: 'Гости', rooms: 'Номера', roomType: 'Тип номера',
    service: 'Сервисный сбор', total: 'Итого', bookingId: '№ бронирования', preparing: 'Готовим ваше бронирование', errorTitle: 'Ошибка бронирования',
    backToHotels: 'К отелям', missing: 'Данные бронирования отсутствуют или неверны. Вернитесь и выберите даты.', failed: 'Не удалось подготовить бронирование',
    nights: (n) => `${n} ноч.`, guestsN: (n) => `${n} гост.`, roomsN: (n) => `${n} ном.` },
  zh: { back: '返回酒店', secure: '安全结账', titleA: '完成您的', titleB: '预订', summary: '预订摘要',
    checkIn: '入住', checkOut: '退房', duration: '时长', guests: '客人', rooms: '客房', roomType: '房型',
    service: '服务费', total: '总计', bookingId: '预订编号', preparing: '正在准备您的预订', errorTitle: '预订错误',
    backToHotels: '返回酒店列表', missing: '预订信息缺失或无效，请返回并选择日期。', failed: '无法准备预订',
    nights: (n) => `${n} 晚`, guestsN: (n) => `${n} 位客人`, roomsN: (n) => `${n} 间客房` },
  ja: { back: 'ホテルに戻る', secure: '安全なお支払い', titleA: 'ご予約を', titleB: '完了する', summary: '予約内容',
    checkIn: 'チェックイン', checkOut: 'チェックアウト', duration: '宿泊数', guests: 'ゲスト', rooms: '客室', roomType: '客室タイプ',
    service: 'サービス料', total: '合計', bookingId: '予約ID', preparing: 'ご予約を準備中', errorTitle: '予約エラー',
    backToHotels: 'ホテル一覧へ', missing: '予約情報が不足しているか無効です。戻って日付を選択してください。', failed: '予約を準備できませんでした',
    nights: (n) => `${n}泊`, guestsN: (n) => `${n}名`, roomsN: (n) => `${n}室` },
};

function fmtDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${iso}T00:00:00`));
  } catch { return iso; }
}

function Spinner({ label }: { label: string }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '60px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '1px solid var(--vg-gold-border)', borderTop: '1px solid var(--vg-gold)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.2rem' }} />
        <div style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.6rem', letterSpacing: '0.2em', color: 'var(--vg-text-3)', textTransform: 'uppercase' }}>{label}</div>
      </div>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid var(--vg-border)' }}>
      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)', textAlign: 'end', minWidth: 0, overflowWrap: 'anywhere' }}>{value}</span>
    </div>
  );
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params.locale as string) || 'en';
  const w = WORDS[locale] ?? WORDS.en;
  const router = useRouter();
  const { status } = useSession();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [hotel, setHotel] = useState<BookingHotelSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const initKey = useRef('');

  const itemId   = searchParams.get('itemId');
  const roomType = searchParams.get('roomType') || 'Standard';
  const stay     = parseStayParams(`?${searchParams.toString()}`);
  const checkIn  = stay.checkIn;
  const checkOut = stay.checkOut;
  const guests   = stay.guests ?? 1;
  const rooms    = stay.rooms ?? 1;

  const initBooking = useCallback(async () => {
    try {
      setLoading(true);
      const hotelRes = await fetch(`/api/hotels/${itemId}`);
      if (!hotelRes.ok) { throw new Error('Hotel not found'); }
      const hotelData = await hotelRes.json();
      setHotel(hotelData);

      // The SERVER computes the price (room x nights x rooms + tax). We only
      // send what the user chose and display what the server returns, so the
      // amount shown here is always the amount that will be charged.
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hotel', itemId, roomType,
          startDate: new Date(checkIn).toISOString(), endDate: new Date(checkOut).toISOString(),
          checkInDate: new Date(checkIn).toISOString(), checkOutDate: new Date(checkOut).toISOString(),
          guests, rooms,
        }),
      });
      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) { throw new Error(bookingData.error || 'Failed to create booking'); }

      const nights = bookingData.nights ?? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
      setBooking({
        ...bookingData,
        checkIn, checkOut, nights,
        pricePerNight: bookingData.nightlyPrice ?? hotelData.pricePerNight,
        amount: bookingData.piAmount,          // what will be charged, in Pi
        totalPrice: bookingData.totalPrice,    // same total in the hotel currency
        currency: bookingData.currency,
        roomType: bookingData.roomType || roomType,
        hotelName: hotelData.name,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : w.failed);
    } finally { setLoading(false); }
  }, [itemId, checkIn, checkOut, roomType, guests, rooms, w.failed]);

  useEffect(() => {
    if (status === 'loading') { return; }
    if (status === 'unauthenticated') {
      router.replace(`/${locale}/auth/signin`);
      return;
    }
    if (!itemId || !checkIn || !checkOut) {
      setError(w.missing); setLoading(false); return;
    }
    // one booking per visit: re-renders must not create a second pending booking
    const key = [itemId, roomType, checkIn, checkOut, guests, rooms].join('|');
    if (initKey.current === key) { return; }
    initKey.current = key;
    void initBooking();
  }, [status, itemId, roomType, checkIn, checkOut, guests, rooms, initBooking, router, locale, w.missing]);

  if (status === 'loading' || loading) { return <Spinner label={w.preparing} />; }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', paddingTop: '80px' }}>
        <div style={{ background: 'var(--vg-bg-card)', border: '1px solid rgba(239,68,68,0.3)', padding: 'clamp(1.5rem,5vw,2.5rem)', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#ef4444' }}>
            <AlertCircle size={22} />
          </div>
          <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.8rem', fontWeight: 300, color: 'var(--vg-text)', marginBottom: '0.75rem' }}>{w.errorTitle}</div>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.84rem', color: 'var(--vg-text-2)', marginBottom: '2rem', lineHeight: 1.7 }}>{error}</p>
          <button onClick={() => router.push(`/${locale}/hotels`)} className="vg-btn-primary" style={{ width: '100%', justifyContent: 'center', minHeight: '48px' }}>{w.backToHotels}</button>
        </div>
      </div>
    );
  }

  if (!booking || !hotel) { return null; }

  // Lines shown to the visitor; the fee is whatever the server added on top of the room cost.
  const nights = booking.nights ?? 0;
  const perNight = booking.pricePerNight ?? 0;
  const subtotal = perNight * nights * rooms;
  const fee = Math.max(0, (booking.totalPrice ?? subtotal) - subtotal);
  const feePct = subtotal > 0 ? Math.round((fee / subtotal) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--vg-bg)', paddingTop: '60px' }}>

      {/* Header */}
      <div style={{ background: 'var(--vg-bg-surface)', borderBottom: '1px solid var(--vg-border)', padding: '0.4rem clamp(1rem,7vw,5rem)' }}>
        <Link href={`/${locale}/hotels/${itemId}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', minHeight: '44px', fontFamily: 'var(--font-space-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--vg-text-3)' }}>
          <ArrowLeft size={14} style={{ transform: locale === 'ar' ? 'scaleX(-1)' : undefined }} /> {w.back}
        </Link>
      </div>

      <div style={{ padding: 'clamp(1.5rem,5vw,4rem) clamp(1rem,7vw,5rem)', maxWidth: '900px', margin: '0 auto' }}>

        <div className="vg-overline" style={{ marginBottom: '1rem' }}>{w.secure}</div>
        <h1 className="vg-display" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', marginBottom: 'clamp(1.5rem,4vw,2.5rem)' }}>
          {w.titleA} <em className="vg-italic">{w.titleB}</em>
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,340px)', gap: '2rem' }} className="booking-grid">
          <style>{'@media(max-width:800px){.booking-grid{grid-template-columns:1fr!important}}'}</style>

          {/* Booking Summary */}
          <div style={{ background: 'var(--vg-bg-card)', border: '1px solid var(--vg-border)', padding: 'clamp(1.2rem,4vw,2rem)' }}>
            <div style={{ height: '1px', background: 'linear-gradient(to right, transparent, var(--vg-gold), transparent)', marginBottom: '1.5rem', opacity: 0.6 }} />

            <div className="vg-overline" style={{ marginBottom: '1.2rem' }}>{w.summary}</div>

            {/* Hotel name */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem', padding: '1rem 0', borderBottom: '1px solid var(--vg-border)', marginBottom: '0.5rem' }}>
              <div style={{ width: '32px', height: '32px', border: '1px solid var(--vg-gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vg-gold)', flexShrink: 0 }}>
                <MapPin size={13} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: '1.3rem', fontWeight: 300, color: 'var(--vg-text)', overflowWrap: 'anywhere' }}>{hotel.name}</div>
                <div style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.78rem', color: 'var(--vg-text-3)' }}>
                  {hotel.cityRelation?.name || hotel.city}, {hotel.cityRelation?.country || hotel.country}
                </div>
              </div>
            </div>

            <SummaryRow label={w.checkIn} value={fmtDate(checkIn, locale)} />
            <SummaryRow label={w.checkOut} value={fmtDate(checkOut, locale)} />
            <SummaryRow label={w.duration} value={w.nights(nights)} />
            <SummaryRow label={w.guests} value={w.guestsN(guests)} />
            <SummaryRow label={w.rooms} value={w.roomsN(rooms)} />
            <SummaryRow label={w.roomType} value={booking.roomType || roomType} />

            {/* Price */}
            <div style={{ background: 'var(--vg-bg-surface)', padding: '1.2rem', marginTop: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)' }}>
                  {formatCurrency(perNight, booking.currency)} × {w.nights(nights)} × {w.roomsN(rooms)}
                </span>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)', flexShrink: 0 }}>
                  {formatCurrency(subtotal, booking.currency)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-3)' }}>
                  {w.service}{feePct ? ` (${feePct}%)` : ''}
                </span>
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: '0.8rem', color: 'var(--vg-text-2)', flexShrink: 0 }}>
                  {formatCurrency(fee, booking.currency)}
                </span>
              </div>
              <div style={{ height: '1px', background: 'var(--vg-gold-border)', margin: '0.75rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.62rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--vg-text-2)' }}>{w.total}</span>
                <span className="vg-stat-num" style={{ fontSize: '1.5rem' }}>{formatPi(booking.amount ?? 0)}</span>
              </div>
            </div>

            <p style={{ fontFamily: 'var(--font-space-mono)', fontSize: '0.56rem', letterSpacing: '0.1em', color: 'var(--vg-text-3)', textAlign: 'center', marginTop: '1rem' }}>
              {w.bookingId}: {booking.id?.slice(0, 8)?.toUpperCase()}
            </p>
          </div>

          {/* Payment */}
          <div>
            <PaymentFlow booking={booking} />
          </div>
        </div>
      </div>
    </div>
  );
}
