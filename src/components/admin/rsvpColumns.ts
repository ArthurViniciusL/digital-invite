import { formatWhatsappNumber } from '@/lib/formatters/whatsappNumber';
import { formatRsvpDateTime } from '@/lib/formatters/rsvpDateTime';
import { type RsvpRecord } from '@/lib/schemas/rsvpSchema';

export interface RsvpColumn {
  key: string;
  label: string;
  className: string;
  placeholderWidth: string;
  cell: (record: RsvpRecord) => string | number;
}

export const RSVP_COLUMNS: RsvpColumn[] = [
  {
    key: 'name',
    label: 'Nome',
    className: 'font-medium whitespace-nowrap',
    placeholderWidth: 'w-32',
    cell: (record) => record.name,
  },
  {
    key: 'guestCount',
    label: 'Pessoas',
    className: 'text-right tabular-nums',
    placeholderWidth: 'w-8',
    cell: (record) => record.guestCount,
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    className: 'whitespace-nowrap',
    placeholderWidth: 'w-28',
    cell: (record) => formatWhatsappNumber(record.whatsapp),
  },
  {
    key: 'email',
    label: 'E-mail',
    className: 'whitespace-nowrap',
    placeholderWidth: 'w-40',
    cell: (record) => record.email,
  },
  {
    key: 'createdAt',
    label: 'Confirmado em',
    className: 'whitespace-nowrap',
    placeholderWidth: 'w-24',
    cell: (record) => formatRsvpDateTime(record.createdAt),
  },
];
