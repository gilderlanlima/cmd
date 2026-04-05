export interface UserWorkScheduleEntry {
  weekday: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday"
];

const normalizeTime = (value: unknown, fallback: string): string => {
  if (typeof value !== "string" || !/^\d{2}:\d{2}$/.test(value)) {
    return fallback;
  }

  return value;
};

export const buildDefaultUserWorkSchedule = (
  startWork = "00:00",
  endWork = "23:59"
): UserWorkScheduleEntry[] =>
  WEEKDAYS.map(weekday => ({
    weekday,
    enabled: true,
    startTime: startWork,
    endTime: endWork
  }));

export const normalizeUserWorkSchedule = (
  workSchedule: unknown,
  fallbackStart = "00:00",
  fallbackEnd = "23:59"
): UserWorkScheduleEntry[] => {
  const defaults = buildDefaultUserWorkSchedule(fallbackStart, fallbackEnd);

  if (!Array.isArray(workSchedule)) {
    return defaults;
  }

  return defaults.map(defaultEntry => {
    const savedEntry = workSchedule.find(
      entry =>
        entry &&
        typeof entry === "object" &&
        "weekday" in entry &&
        (entry as UserWorkScheduleEntry).weekday === defaultEntry.weekday
    ) as Partial<UserWorkScheduleEntry> | undefined;

    if (!savedEntry) {
      return defaultEntry;
    }

    return {
      weekday: defaultEntry.weekday,
      enabled:
        typeof savedEntry.enabled === "boolean"
          ? savedEntry.enabled
          : defaultEntry.enabled,
      startTime: normalizeTime(savedEntry.startTime, fallbackStart),
      endTime: normalizeTime(savedEntry.endTime, fallbackEnd)
    };
  });
};

export const extractLegacyHoursFromWorkSchedule = (
  workSchedule: unknown,
  fallbackStart = "00:00",
  fallbackEnd = "23:59"
): { startWork: string; endWork: string } => {
  const normalizedSchedule = normalizeUserWorkSchedule(
    workSchedule,
    fallbackStart,
    fallbackEnd
  );
  const enabledEntries = normalizedSchedule.filter(entry => entry.enabled);

  if (!enabledEntries.length) {
    return {
      startWork: fallbackStart,
      endWork: fallbackEnd
    };
  }

  const sortedStarts = enabledEntries
    .map(entry => entry.startTime)
    .sort((a, b) => a.localeCompare(b));
  const sortedEnds = enabledEntries
    .map(entry => entry.endTime)
    .sort((a, b) => a.localeCompare(b));

  return {
    startWork: sortedStarts[0] || fallbackStart,
    endWork: sortedEnds[sortedEnds.length - 1] || fallbackEnd
  };
};

export const isDateWithinUserWorkSchedule = (
  workSchedule: unknown,
  date = new Date(),
  fallbackStart = "00:00",
  fallbackEnd = "23:59"
): boolean => {
  const weekdayMap = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ];
  const normalizedSchedule = normalizeUserWorkSchedule(
    workSchedule,
    fallbackStart,
    fallbackEnd
  );
  const todayWeekday = weekdayMap[date.getDay()];
  const todaySchedule = normalizedSchedule.find(
    entry => entry.weekday === todayWeekday
  );

  if (!todaySchedule || !todaySchedule.enabled) {
    return false;
  }

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const [startHour, startMinute] = todaySchedule.startTime
    .split(":")
    .map(Number);
  const [endHour, endMinute] = todaySchedule.endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};
