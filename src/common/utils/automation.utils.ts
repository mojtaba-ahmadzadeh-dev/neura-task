import { AutomationType } from 'src/common/enums/automation-type.enum';

function getTimezoneOffsetMinutes(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const get = (type: string) => +(parts.find((p) => p.type === type)?.value ?? 0);

  const asUTC = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour') === 24 ? 0 : get('hour'),
    get('minute'),
    get('second'),
  );
  return (asUTC - date.getTime()) / 60000; // minutes: tz - utc
}

// ساعت/روز محلی (مثلا 10:00 به وقت تهران) رو به لحظه‌ی واقعی UTC تبدیل می‌کنه
function zonedWallTimeToUtc(
  year: number,
  month: number, // 0-based
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): Date {
  // حدس اولیه با فرض UTC
  const guess = new Date(Date.UTC(year, month, day, hour, minute, second));
  // آفست واقعی رو حساب کن و اصلاح کن (یک بار کافیه چون DST به‌ندرت روی همون لحظه اثر می‌ذاره)
  const offsetMinutes = getTimezoneOffsetMinutes(guess, timeZone);
  return new Date(guess.getTime() - offsetMinutes * 60000);
}

export function calculateNextRunAt(dto: {
  timeOfDay: string;
  daysOfWeek?: string[];
  timezone?: string;
  type?: AutomationType;
}): Date {
  const timezone = dto.timezone ?? 'Asia/Tehran';
  const [hours, minutes, seconds = 0] = dto.timeOfDay.split(':').map(Number);

  const now = new Date();

  // امروز رو به وقت محلی تایم‌زون هدف بگیر (سال/ماه/روز)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const get = (type: string) => +(parts.find((p) => p.type === type)?.value ?? 0);

  let currentYear = get('year');
  let currentMonth = get('month') - 1;
  let currentDay = get('day');

  let next = zonedWallTimeToUtc(
    currentYear,
    currentMonth,
    currentDay,
    hours,
    minutes,
    seconds,
    timezone,
  );

  // اگه لحظه‌ی محاسبه‌شده برای امروز گذشته، برو سراغ فردا
  if (next <= now) {
    const nextDay = new Date(Date.UTC(currentYear, currentMonth, currentDay + 1));
    currentYear = nextDay.getUTCFullYear();
    currentMonth = nextDay.getUTCMonth();
    currentDay = nextDay.getUTCDate();
    next = zonedWallTimeToUtc(
      currentYear,
      currentMonth,
      currentDay,
      hours,
      minutes,
      seconds,
      timezone,
    );
  }

  if (dto.type === AutomationType.RECURRING && dto.daysOfWeek?.length) {
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    const allowedDays = dto.daysOfWeek.map((d) => dayMap[d.toLowerCase()]);

    // getUTCDay روی "next" چون next یک لحظه‌ی UTC واقعیه، اما روز هفته باید طبق تایم‌زون محلی باشه
    const dowFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long',
    });

    for (let i = 0; i < 7; i++) {
      const localDow = dowFormatter.format(next).toLowerCase();
      if (allowedDays.includes(dayMap[localDow])) {
        break;
      }
      next = new Date(next.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  return next;
}
