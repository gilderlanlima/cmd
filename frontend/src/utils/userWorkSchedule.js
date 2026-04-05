export const USER_WORK_SCHEDULE_DAYS = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terca-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sabado" },
  { key: "sunday", label: "Domingo" }
];

const normalizeTime = (value, fallback) =>
  typeof value === "string" && /^\d{2}:\d{2}$/.test(value) ? value : fallback;

export const buildDefaultUserWorkSchedule = (
  startWork = "00:00",
  endWork = "23:59"
) =>
  USER_WORK_SCHEDULE_DAYS.map(day => ({
    weekday: day.key,
    enabled: true,
    startTime: startWork,
    endTime: endWork
  }));

export const normalizeUserWorkSchedule = (
  workSchedule,
  startWork = "00:00",
  endWork = "23:59"
) => {
  const defaults = buildDefaultUserWorkSchedule(startWork, endWork);

  if (!Array.isArray(workSchedule)) {
    return defaults;
  }

  return defaults.map(defaultEntry => {
    const savedEntry = workSchedule.find(
      entry => entry && entry.weekday === defaultEntry.weekday
    );

    if (!savedEntry) {
      return defaultEntry;
    }

    return {
      weekday: defaultEntry.weekday,
      enabled:
        typeof savedEntry.enabled === "boolean"
          ? savedEntry.enabled
          : defaultEntry.enabled,
      startTime: normalizeTime(savedEntry.startTime, startWork),
      endTime: normalizeTime(savedEntry.endTime, endWork)
    };
  });
};
