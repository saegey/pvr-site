// Lightweight GA4 helpers for event tracking via gatsby-plugin-google-gtag

type LinkClickParams = {
  linkText?: string;
  linkUrl: string;
  linkType?: 'external' | 'internal';
  location?: string; // e.g., 'links_page', 'header', etc.
};

type StreamClickParams = {
  service: 'discogs' | 'apple_music' | 'spotify' | 'soundcloud' | string;
  linkUrl: string;
  location?: string; // e.g., 'streaming_links', 'track_card'
  showSlug?: string;
  trackTitle?: string;
};

export function trackEvent(
  name: string,
  params?: Record<string, any>
): void {
  if (typeof window === 'undefined') return;
  const gtag = (window as any).gtag as
    | ((...args: any[]) => void)
    | undefined;
  // In development, mark events for GA DebugView and log when gtag is absent
  const isDev = process.env.NODE_ENV !== 'production';
  const payload = isDev ? { ...(params ?? {}), debug_mode: true } : params ?? {};
  if (!gtag) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info('[analytics] gtag not available; event:', name, payload);
    }
    // enqueue and attempt to flush when gtag appears
    enqueue({ name, params: payload });
    scheduleFlush();
    return;
  }
  try {
    gtag('event', name, payload);
  } catch {
    // ignore
  }
}

export function trackLinkClick({
  linkText,
  linkUrl,
  linkType = 'external',
  location = 'links_page',
}: LinkClickParams): void {
  trackEvent('link_click', {
    link_text: linkText,
    link_url: linkUrl,
    link_type: linkType,
    location,
  });
}

export function trackStreamClick({
  service,
  linkUrl,
  location = 'streaming_links',
  showSlug,
  trackTitle,
}: StreamClickParams): void {
  trackEvent('stream_click', {
    service,
    link_url: linkUrl,
    location,
    show_slug: showSlug,
    track_title: trackTitle,
  });
}

// --- Deduplication helpers (avoid duplicate events if multiple handlers fire) ---
const _lastEventTimes = new Map<string, number>();
type QueuedEvent = { name: string; params: Record<string, any> };
const _queue: QueuedEvent[] = [];
let _flushTimer: number | undefined;
let _flushAttempts = 0;

function enqueue(ev: QueuedEvent) {
  _queue.push(ev);
}

function flushQueue(): boolean {
  if (typeof window === 'undefined') return false;
  const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
  if (!gtag) return false;
  while (_queue.length) {
    const ev = _queue.shift()!;
    try {
      gtag('event', ev.name, ev.params);
    } catch {
      // ignore individual failures
    }
  }
  return true;
}

function scheduleFlush() {
  if (typeof window === 'undefined') return;
  if (_flushTimer) return;
  _flushAttempts = 0;
  _flushTimer = window.setInterval(() => {
    _flushAttempts += 1;
    if (flushQueue() || _flushAttempts > 20) {
      if (_flushTimer) {
        window.clearInterval(_flushTimer);
        _flushTimer = undefined;
      }
    }
  }, 500);
}

function shouldSend(key: string, windowMs = 500): boolean {
  const now = Date.now();
  const last = _lastEventTimes.get(key) ?? 0;
  if (now - last < windowMs) return false;
  _lastEventTimes.set(key, now);
  return true;
}

export function trackEventDeduped(
  name: string,
  params?: Record<string, any>,
  options?: { key?: string; windowMs?: number }
): void {
  const key =
    options?.key ?? `${name}:${params?.link_url ?? ''}:${params?.location ?? ''}:${params?.link_text ?? ''}`;
  if (!shouldSend(key, options?.windowMs)) return;
  trackEvent(name, params);
}

export function trackLinkClickDeduped(
  params: LinkClickParams,
  windowMs = 500
): void {
  const key = `link_click:${params.linkUrl}:${params.location ?? ''}`;
  if (!shouldSend(key, windowMs)) return;
  trackLinkClick(params);
}

export function trackStreamClickDeduped(
  params: StreamClickParams,
  windowMs = 500
): void {
  const key = `stream_click:${params.service}:${params.linkUrl}:${params.location ?? ''}`;
  if (!shouldSend(key, windowMs)) return;
  trackStreamClick(params);
}
