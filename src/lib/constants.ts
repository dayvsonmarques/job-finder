export const SEARCH_INTERVALS = [
  { label: "3 horas", value: 3 },
  { label: "6 horas", value: 6 },
  { label: "9 horas", value: 9 },
  { label: "12 horas", value: 12 },
];

export const JOB_SOURCES = {
  REMOTIVE: "Remotive",
  ARBEITNOW: "Arbeitnow",
} as const;

export const CHECK_INTERVAL_MS = 5 * 60 * 1000;

export const DEFAULT_CONFIG_ID = "default";
