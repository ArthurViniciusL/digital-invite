import { formatWhatsappNumber } from '@/lib/formatters/whatsappNumber';
import { formatRsvpDateTime } from '@/lib/formatters/rsvpDateTime';
import { type RsvpRecord } from '@/lib/schemas/rsvpSchema';

const cellClassName =
  'px-4 py-3 align-middle font-body text-lg text-carved-black whitespace-nowrap';

interface RsvpTableRowProps {
  record: RsvpRecord;
}

export function RsvpTableRow({ record }: RsvpTableRowProps) {
  return (
    <tr className="border-b-2 border-sertao-brown last:border-b-0">
      <th scope="row" className={`${cellClassName} text-left text-xl`}>
        {record.name}
      </th>
      <td className={`${cellClassName} text-right tabular-nums`}>{record.guestCount}</td>
      <td className={cellClassName}>{formatWhatsappNumber(record.whatsapp)}</td>
      <td className={cellClassName}>{record.email}</td>
      <td className={cellClassName}>{formatRsvpDateTime(record.createdAt)}</td>
      <td className={`${cellClassName} font-title text-sm tracking-wide uppercase`}>
        {record.status}
      </td>
    </tr>
  );
}
