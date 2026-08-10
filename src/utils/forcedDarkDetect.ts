export function isForcedDarkActive(): boolean {
  try {
    const bodyStyle = getComputedStyle(document.body);
    const bg = bodyStyle.backgroundColor;
    const rgb = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgb) return false;
    const [, r, g, b] = rgb.map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.45;
  } catch {
    return false;
  }
}

export function shouldShowForcedDarkNotice(): boolean {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem('forced-dark-notice-dismissed') === 'true') return false;
  if (localStorage.getItem('forced-dark-notice-hidden') === 'true') return false;
  return isForcedDarkActive();
}

export function dismissForcedDarkNotice(): void {
  sessionStorage.setItem('forced-dark-notice-dismissed', 'true');
}

export function hideForcedDarkNoticePermanently(): void {
  localStorage.setItem('forced-dark-notice-hidden', 'true');
  dismissForcedDarkNotice();
}