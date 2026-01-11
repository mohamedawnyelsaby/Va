declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    mixpanel?: any;
  }
}

export class Analytics {
  static trackPageView(url: string, title?: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID!, {
        page_path: url,
        page_title: title,
      });
    }

    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Page View', {
        url,
        title,
      });
    }
  }

  static trackEvent(
    action: string,
    category: string,
    label?: string,
    value?: number
  ) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }

    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track(action, {
        category,
        label,
        value,
      });
    }
  }

  static trackSearch(query: string, results: number) {
    this.trackEvent('search', 'Search', query, results);
  }

  static trackHotelClick(hotelId: string, hotelName: string) {
    this.trackEvent('hotel_click', 'Hotel', hotelName);
    
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Hotel Clicked', {
        hotel_id: hotelId,
        hotel_name: hotelName,
      });
    }
  }

  static trackBookingStarted(
    hotelId: string,
    hotelName: string,
    amount: number
  ) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        items: [
          {
            item_id: hotelId,
            item_name: hotelName,
            price: amount,
            quantity: 1,
          },
        ],
      });
    }

    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Booking Started', {
        hotel_id: hotelId,
        hotel_name: hotelName,
        amount,
      });
    }
  }

  static trackBookingCompleted(
    bookingId: string,
    hotelId: string,
    hotelName: string,
    amount: number,
    currency: string
  ) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: bookingId,
        value: amount,
        currency: currency,
        items: [
          {
            item_id: hotelId,
            item_name: hotelName,
            price: amount,
            quantity: 1,
          },
        ],
      });
    }

    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Booking Completed', {
        booking_id: bookingId,
        hotel_id: hotelId,
        hotel_name: hotelName,
        amount,
        currency,
      });
      
      window.mixpanel.people.track_charge(amount);
    }
  }

  static trackSignUp(userId: string, method: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'sign_up', {
        method: method,
      });
    }

    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.alias(userId);
      window.mixpanel.track('Sign Up', {
        method,
      });
      window.mixpanel.people.set({
        $name: userId,
        $created: new Date().toISOString(),
        signup_method: method,
      });
    }
  }

  static trackLogin(userId: string, method: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'login', {
        method: method,
      });
    }

    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.identify(userId);
      window.mixpanel.track('Login', {
        method,
      });
    }
  }

  static identifyUser(
    userId: string,
    userProperties: {
      email?: string;
      name?: string;
      tier?: string;
      [key: string]: any;
    }
  ) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', 'user_properties', {
        user_id: userId,
        ...userProperties,
      });
    }

    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.identify(userId);
      window.mixpanel.people.set(userProperties);
    }
  }

  static trackError(error: Error, context?: Record<string, any>) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }

    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Error', {
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      });
    }
  }

  static trackShare(contentType: string, contentId: string, method: string) {
    this.trackEvent('share', 'Social', `${contentType}:${contentId}`, undefined);
    
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Content Shared', {
        content_type: contentType,
        content_id: contentId,
        share_method: method,
      });
    }
  }

  static trackPiPayment(
    action: 'initiated' | 'approved' | 'completed' | 'cancelled',
    amount: number,
    paymentId: string
  ) {
    this.trackEvent(`pi_payment_${action}`, 'Payment', paymentId, amount);
    
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Pi Payment', {
        action,
        amount,
        payment_id: paymentId,
      });
    }
  }
}
