/**
 * Analytics & Tracking System
 * High-Tech Gradient VA Travel Platform
 */

interface TrackingEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: number;
}

interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActiveTime: number;
  events: TrackingEvent[];
}

class AnalyticsTracker {
  private sessionId: string;
  private userId: string | null;
  private events: TrackingEvent[] = [];
  private sessionStartTime: number = Date.now();
  private lastEventTime: number = Date.now();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.initializeSession();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeSession() {
    // Initialize session in localStorage
    const session: UserSession = {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      lastActiveTime: Date.now(),
      events: [],
    };

    try {
      sessionStorage.setItem('va_session', JSON.stringify(session));
    } catch (e) {
      console.warn('SessionStorage not available');
    }

    // Track page view
    this.trackEvent('page_view', {
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      timestamp: Date.now(),
    });
  }

  /**
   * Track a custom event
   */
  trackEvent(name: string, properties?: Record<string, any>) {
    const event: TrackingEvent = {
      name,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(event);
    this.lastEventTime = Date.now();

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', name, properties);
    }

    // Send to analytics endpoint
    this.sendEvent(event);

    // Update session time
    this.updateSessionActivity();
  }

  /**
   * Track user interaction
   */
  trackInteraction(action: string, target: string) {
    this.trackEvent('user_interaction', {
      action,
      target,
      timestamp: Date.now(),
    });
  }

  /**
   * Track search query
   */
  trackSearch(query: string, filters?: Record<string, any>) {
    this.trackEvent('search', {
      query,
      filters,
      timestamp: Date.now(),
    });
  }

  /**
   * Track booking initiated
   */
  trackBookingStart(destination: string, hotelId?: string) {
    this.trackEvent('booking_start', {
      destination,
      hotelId,
      timestamp: Date.now(),
    });
  }

  /**
   * Track booking completed
   */
  trackBookingComplete(destination: string, amount: number, paymentMethod: string) {
    this.trackEvent('booking_complete', {
      destination,
      amount,
      paymentMethod,
      timestamp: Date.now(),
    });
  }

  /**
   * Track AI interaction
   */
  trackAIInteraction(query: string, responseTime: number) {
    this.trackEvent('ai_interaction', {
      query,
      responseTime,
      timestamp: Date.now(),
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: string) {
    this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    });
  }

  /**
   * Set user ID
   */
  setUserId(userId: string) {
    this.userId = userId;
    this.trackEvent('user_identified', { userId });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>) {
    this.trackEvent('user_properties', properties);
  }

  /**
   * Send event to backend
   */
  private sendEvent(event: TrackingEvent) {
    const payload = {
      sessionId: this.sessionId,
      userId: this.userId,
      event,
    };

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/events', JSON.stringify(payload));
    } else {
      // Fallback to fetch
      fetch('/api/analytics/events', {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((e) => console.error('Analytics error:', e));
    }
  }

  /**
   * Update session activity
   */
  private updateSessionActivity() {
    try {
      const session = sessionStorage.getItem('va_session');
      if (session) {
        const parsed = JSON.parse(session);
        parsed.lastActiveTime = Date.now();
        parsed.events = this.events;
        sessionStorage.setItem('va_session', JSON.stringify(parsed));
      }
    } catch (e) {
      console.warn('Could not update session');
    }
  }

  /**
   * Get session duration
   */
  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  /**
   * Get events
   */
  getEvents(): TrackingEvent[] {
    return this.events;
  }

  /**
   * Clear events
   */
  clearEvents() {
    this.events = [];
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker();

// Page visibility tracking
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      analytics.trackEvent('page_hidden');
    } else {
      analytics.trackEvent('page_visible');
    }
  });
}

// Unload tracking
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analytics.trackEvent('page_unload', {
      sessionDuration: analytics.getSessionDuration(),
      eventCount: analytics.getEvents().length,
    });
  });
}

export default analytics;
