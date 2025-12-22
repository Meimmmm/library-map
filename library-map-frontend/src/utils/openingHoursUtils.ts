// src/utils/openingHoursUtils.ts
import OpeningHours from "opening_hours";   //OMS library

export type LibraryStatus = {
  label: string;
  isOpen: boolean;
};

export function getLibraryStatusFromOSM(
  openingHoursRaw?: string,
  now: Date = new Date()
): LibraryStatus {
  if (!openingHoursRaw) {
    return { label: "Hours not available", isOpen: false };
  }

  try {
    const oh = new OpeningHours(openingHoursRaw);

    const isOpen = oh.getState(now);

    const nextChange = oh.getNextChange(now);
    if (!nextChange) {
      return {
        label: isOpen ? "Open" : "Closed",
        isOpen,
      };
    }

    const next = new Date(nextChange);
    const hhmm = next.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (isOpen) {
      return {
        label: `Open — until ${hhmm}`,
        isOpen: true,
      };
    } else {
      return {
        label: `Closed — opens ${hhmm}`,
        isOpen: false,
      };
    }
  } catch {
    return { label: "Hours unavailable", isOpen: false };
  }
}
