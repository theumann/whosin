// Pin timezone before any module (e.g. lib/messages' Intl formatter) loads, so
// date-dependent assertions are stable regardless of the host timezone.
process.env.TZ = "UTC";
