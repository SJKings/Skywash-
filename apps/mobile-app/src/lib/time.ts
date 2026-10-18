// Lagos (Africa/Lagos, West Africa Time) time, without relying on Intl time
// zone support, which varies between Hermes builds. All bookings are in Lagos,
// so dates and times are always in WAT, whatever zone the phone is set to.
// WAT is UTC+1 all year (Nigeria has no daylight saving time).

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const WAT_OFFSET_HOURS = 1;

/** A Date whose UTC fields read as the Lagos wall-clock time of `instant`. */
function toLagosWallClock(instant: Date) {
  return new Date(instant.getTime() + WAT_OFFSET_HOURS * HOUR);
}

/** A calendar day in Lagos, e.g. "2026-10-20". */
export type DayKey = string;

function dayKeyOf(wall: Date): DayKey {
  return wall.toISOString().slice(0, 10);
}

export function todayKey(now = new Date()): DayKey {
  return dayKeyOf(toLagosWallClock(now));
}

export function addDays(key: DayKey, days: number): DayKey {
  return dayKeyOf(new Date(Date.parse(`${key}T00:00:00Z`) + days * DAY));
}

/** The instant of a Lagos wall-clock time ("09:30") on a day, as ISO 8601 with offset. */
export function lagosIso(key: DayKey, time: string) {
  return `${key}T${time}:00+01:00`;
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
  const wall = toLagosWallClock(new Date(iso));
  const time = `${String(wall.getUTCHours()).padStart(2, '0')}:${String(wall.getUTCMinutes()).padStart(2, '0')}`;
  return `${formatDay(dayKeyOf(wall), now)} · ${formatSlot(time)}`;
}

/** True when a slot on a day has already started (can't be booked). */
export function isPast(key: DayKey, time: string, now = new Date()) {
  return Date.parse(lagosIso(key, time)) <= now.getTime();
}
