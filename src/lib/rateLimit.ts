// Pure cooldown check: true if `lastAt` is recent enough that a new request
// for the same key should be suppressed.
export function isRateLimited(lastAt: number | undefined, now: number, cooldownMs: number) {
  return lastAt !== undefined && now - lastAt < cooldownMs;
}
