interface CalendarEvent {
  title: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  location: string;
  description: string;
}

export const BIRTHDAY_EVENT: CalendarEvent = {
  title: 'Aniversário do Muri',
  startsAt: '20260927T113000',
  endsAt: '20260927T200000',
  timeZone: 'America/Sao_Paulo',
  location: 'Alto da Serra Recepções, Cuité',
  description: 'Venha celebrar com a gente',
};

export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${event.startsAt}/${event.endsAt}`,
    ctz: event.timeZone,
    details: event.description,
    location: event.location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
