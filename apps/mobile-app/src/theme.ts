// Design tokens from design/HANDOFF.md.

export const colors = {
  brand: '#0EA5E9', // sky-500: primary buttons, header, selected states
  brandIcon: '#0284C7', // sky-600: icons on tinted fills
  brandText: '#0369A1', // sky-700: prices, links, accent text
  sky200: '#BAE6FD',
  sky100: '#E0F2FE',
  sky50: '#F0F9FF',
  ink: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  inputBg: '#F8FAFC',
  bg: '#F5F8FB',
  white: '#FFFFFF',
  errorBg: '#FEF2F2',
  errorText: '#991B1B',
} as const;

export const fonts = {
  400: 'Archivo_400Regular',
  500: 'Archivo_500Medium',
  600: 'Archivo_600SemiBold',
  700: 'Archivo_700Bold',
  800: 'Archivo_800ExtraBold',
} as const;

export type FontWeight = keyof typeof fonts;

/** Screen side padding. */
export const GUTTER = 20;
