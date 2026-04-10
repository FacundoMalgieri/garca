const TOUR_PREFIX = "garca_tour_";

export function hasSeenTour(tourKey: string): boolean {
  try {
    return localStorage.getItem(`${TOUR_PREFIX}${tourKey}`) === "seen";
  } catch {
    return false;
  }
}

export function markTourSeen(tourKey: string): void {
  try {
    localStorage.setItem(`${TOUR_PREFIX}${tourKey}`, "seen");
  } catch {
    // localStorage unavailable
  }
}

export function resetTour(tourKey: string): void {
  try {
    localStorage.removeItem(`${TOUR_PREFIX}${tourKey}`);
  } catch {
    // localStorage unavailable
  }
}
