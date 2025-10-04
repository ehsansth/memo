// Simple SM-2-ish schedule tailored for binary success.
// Start 5m, 30m, 2h, 1d, 2d, 4d, 7d...
const STEPS = [5, 30, 120, 1440, 2880, 5760, 10080]; // minutes

export function nextInterval(streak: number, success: boolean) {
  if (!success) return STEPS[0];
  const idx = Math.min(streak, STEPS.length - 1);
  return STEPS[idx];
}
