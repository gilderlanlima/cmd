export const WORKING_DAYS = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" }
];

export const createDefaultFollowMeSchedule = () =>
  WORKING_DAYS.reduce((acc, day) => {
    acc[day.key] = {
      enabled: true,
      start: "00:00",
      end: "23:59"
    };
    return acc;
  }, {});

export const normalizeFollowMeSchedule = schedule => {
  const defaults = createDefaultFollowMeSchedule();

  if (!schedule || typeof schedule !== "object") {
    return defaults;
  }

  return WORKING_DAYS.reduce((acc, day) => {
    acc[day.key] = {
      enabled: schedule?.[day.key]?.enabled ?? defaults[day.key].enabled,
      start: schedule?.[day.key]?.start || defaults[day.key].start,
      end: schedule?.[day.key]?.end || defaults[day.key].end,
    };
    return acc;
  }, {});
};
