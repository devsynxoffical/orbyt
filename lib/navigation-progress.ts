export const NAVIGATION_START = "app:navigation-start";

export function startNavigationProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(NAVIGATION_START));
  }
}
