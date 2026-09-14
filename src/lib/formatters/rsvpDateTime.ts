const EMPTY_VALUE = '—';
const TIME_ZONE = 'America/Sao_Paulo';

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: TIME_ZONE,
});

export function formatRsvpDateTime(isoDate: string | null): string {
  if (isoDate === null || isoDate === '') {
    return EMPTY_VALUE;
  }

  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return EMPTY_VALUE;
  }

  const [hour, minute] = timeFormatter.format(parsed).split(':');

  return `${dateFormatter.format(parsed)} ${hour}h${minute}`;
}
