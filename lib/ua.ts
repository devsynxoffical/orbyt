/** Server-side mobile detection from User-Agent (launch API). */
export function isMobileUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    ua
  );
}
