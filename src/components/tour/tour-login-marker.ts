const TOUR_LOGIN_MARKER = 'unihub_tour_just_logged_in';

/**
 * Flags that the user just completed a login flow, so the onboarding tour can
 * auto-start on the dashboard. Stored in sessionStorage (not localStorage) so
 * a plain page reload never replays the tour — only a real sign-in does.
 */
export function markJustLoggedIn(): void {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(TOUR_LOGIN_MARKER, '1');
    }
  } catch {
    // ignore
  }
}

/**
 * Reads and clears the "just logged in" marker. Returns true when the user
 * landed on the dashboard right after signing in.
 */
export function consumeJustLoggedIn(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const value = window.sessionStorage.getItem(TOUR_LOGIN_MARKER);
    window.sessionStorage.removeItem(TOUR_LOGIN_MARKER);
    return value === '1';
  } catch {
    return false;
  }
}
