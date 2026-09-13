const MAX_WHATSAPP_DIGITS = 11;

const SEGMENTS = [
  {
    start: 0,
    end: 2,
    separator: '',
  },
  {
    start: 2,
    end: 3,
    separator: ' ',
  },
  {
    start: 3,
    end: 7,
    separator: ' ',
  },
  {
    start: 7,
    end: MAX_WHATSAPP_DIGITS,
    separator: '-',
  },
];

export function formatWhatsappNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, MAX_WHATSAPP_DIGITS);

  return SEGMENTS.map((segment) => {
    const part = digits.slice(segment.start, segment.end);

    return part === '' ? '' : segment.separator + part;
  }).join('');
}
