// San Diego (America/Los_Angeles) time, without relying on Intl time zone
// support, which varies between Hermes builds. All centers are in San Diego,
// so booking dates and times are always in Pacific time, whatever zone the
// phone is set to.
//
// US daylight saving time: from the second Sunday in March, 2:00 local
// (10:00 UTC) to the first Sunday in November, 2:00 local (09:00 UTC).

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Day of month of the n-th Sunday of a month (month is 0-based). */
function nthSunday(year: number, month: number, n: number) {
  const firstDow = new Date(Date.UTC(year, month, 1)).getUTCDay();
  return 1 + ((7 - firstDow) % 7) + (n - 1) * 7;
}

function isPacificDst(instant: Date) {
  const year = instant.getUTCFullYear();
  const start = Date.UTC(year, 2, nthSunday(year, 2, 2), 10);
  const end = Date.UTC(year, 10, nthSunday(year, 10, 1), 9);
  const t = instant.getTime();
  return t >= start && t < end;
}

/** Pacific UTC offset in hours at an instant: -7 (PDT) or -8 (PST). */
function pacificOffsetHours(instant: Date) {
  return isPacificDst(instant) ? -7 : -8;
}

/** A Date whose UTC fields read as the Pacific wall-clock time of `instant`. */
function toPacificWallClock(instant: Date) {
  return new Date(instant.getTime() + pacificOffsetHours(instant) * HOUR);
}

/** A calendar day in San Diego, e.g. "2026-10-20". */
export type DayKey = string;

function dayKeyOf(wall: Date): DayKey {
  return wall.toISOString().slice(0, 10);
}

export function todayKey(now = new Date()): DayKey {
  return dayKeyOf(toPacificWallClock(now));
}

export function addDays(key: DayKey, days: number): DayKey {
  return dayKeyOf(new Date(Date.parse(`${key}T00:00:00Z`) + days * DAY));
}

/** The instant of a San Diego wall-clock time ("09:30") on a day, as ISO 8601 with offset. */
export function pacificIso(key: DayKey, time: string) {
  // Guess with PST, then correct if that instant falls in DST.
  const guess = new Date(Date.parse(`${key}T${time}:00Z`) + 8 * HOUR);
  const offset = pacificOffsetHours(guess);
  return `${key}T${time}:00${offset === -7 ? '-07:00' : '-08:00'}`;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function weekdayShort(key: DayKey) {
  return WEEKDAYS[new Date(`${key}T00:00:00Z`).getUTCDay()];
}

export function dayOfMonth(key: DayKey) {
  return new Date(`${key}T00:00:00Z`).getUTCDate();
}

/** "8:00 AM" from "08:00". */
export function formatSlot(time: string) {
  const [h, m] = time.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** "Today", "Tomorrow" or "Wed, Oct 21". */
export function formatDay(key: DayKey, now = new Date()) {
  const today = todayKey(now);
  if (key === today) return 'Today';
  if (key === addDays(today, 1)) return 'Tomorrow';
  if (key === addDays(today, -1)) return 'Yesterday';
  const d = new Date(`${key}T00:00:00Z`);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

/** "Today · 9:30 AM" for an ISO instant from the API. */
export function formatWhen(iso: string, now = new Date()) {
  const wall = toPacificWallClock(new Date(iso));
  const time = `${String(wall.getUTCHours()).padStart(2, '0')}:${String(wall.getUTCMinutes()).padStart(2, '0')}`;
  return `${formatDay(dayKeyOf(wall), now)} · ${formatSlot(time)}`;
}

/** True when a slot on a day has already started (can't be booked). */
export function isPast(key: DayKey, time: string, now = new Date()) {
  return Date.parse(pacificIso(key, time)) <= now.getTime();
}
