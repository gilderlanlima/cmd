import moment from "moment-timezone";

const FOLLOW_ME_DAYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

export const normalizeFollowMePhone = (phone?: string | null): string =>
  String(phone || "").replace(/\D/g, "");

export const createDefaultFollowMeSchedule = () =>
  FOLLOW_ME_DAYS.reduce((acc, day) => {
    acc[day] = {
      enabled: true,
      start: "00:00",
      end: "23:59"
    };
    return acc;
  }, {} as Record<string, { enabled: boolean; start: string; end: string }>);

export const normalizeFollowMeSchedule = (schedule?: Record<string, any> | null) => {
  const defaults = createDefaultFollowMeSchedule();

  if (!schedule || typeof schedule !== "object") {
    return defaults;
  }

  return FOLLOW_ME_DAYS.reduce((acc, day) => {
    acc[day] = {
      enabled: schedule?.[day]?.enabled ?? defaults[day].enabled,
      start: schedule?.[day]?.start || defaults[day].start,
      end: schedule?.[day]?.end || defaults[day].end
    };
    return acc;
  }, {} as Record<string, { enabled: boolean; start: string; end: string }>);
};

export const isFollowMeScheduleActive = (schedule?: Record<string, any> | null) => {
  const normalized = normalizeFollowMeSchedule(schedule);
  const now = moment().tz("America/Sao_Paulo");
  const currentDay = FOLLOW_ME_DAYS[now.day()];
  const daySchedule = normalized[currentDay];

  if (!daySchedule?.enabled) {
    return false;
  }

  const currentMinutes = now.hours() * 60 + now.minutes();
  const [startHour, startMinute] = String(daySchedule.start || "00:00")
    .split(":")
    .map(value => Number(value) || 0);
  const [endHour, endMinute] = String(daySchedule.end || "23:59")
    .split(":")
    .map(value => Number(value) || 0);

  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;

  if (startMinutes === endMinutes) {
    return true;
  }

  if (startMinutes < endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
};
