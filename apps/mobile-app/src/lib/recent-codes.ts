// Booking codes created on this device, so customers can find them again
// without typing. Still no account: the codes live only on the phone.
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'skywash.recentCodes';
const MAX = 5;

export async function getRecentCodes(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const codes: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(codes) ? codes.filter((c): c is string => typeof c === 'string') : [];
  } catch {
    return [];
  }
}

export async function addRecentCode(code: string) {
  const codes = [code, ...(await getRecentCodes()).filter((c) => c !== code)].slice(0, MAX);
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(codes));
  } catch {
    // Not critical: the code is also shown on the confirmation screen.
  }
}

/** Normalizes typed input ("sw 4fq2", "4FQ2") to "SW-4FQ2", like the server. */
export function normalizeCode(input: string) {
  const code = input.trim().toUpperCase().replace(/\s+/g, '');
  if (!code) return '';
  return code.startsWith('SW-') ? code : `SW-${code.replace(/^SW-?/, '')}`;
}
