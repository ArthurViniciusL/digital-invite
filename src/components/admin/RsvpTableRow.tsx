import { TableCell, TableRow } from '@/components/ui/table';
import { formatWhatsappNumber } from '@/lib/formatters/whatsappNumber';
import { formatRsvpDateTime } from '@/lib/formatters/rsvpDateTime';
import { type RsvpRecord } from '@/lib/schemas/rsvpSchema';

interface RsvpTableRowProps {
  record: RsvpRecord;
}

export function RsvpTableRow({ record }: RsvpTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium whitespace-nowrap">
        {record.name}
        </TableCell>
      <TableCell className="text-right tabular-nums">
        {record.guestCount}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {formatWhatsappNumber(record.whatsapp)}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {record.email}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {formatRsvpDateTime(record.createdAt)}
      </TableCell>
    </TableRow>
  );
}
