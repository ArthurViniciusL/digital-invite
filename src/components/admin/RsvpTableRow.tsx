import { TableCell, TableRow } from '@/components/ui/table';
import { type RsvpRecord } from '@/lib/schemas/rsvpSchema';
import { RSVP_COLUMNS } from './rsvpColumns';

interface RsvpTableRowProps {
  record: RsvpRecord;
}

export function RsvpTableRow({ record }: RsvpTableRowProps) {
  return (
    <TableRow>
      {RSVP_COLUMNS.map((column) => (
        <TableCell key={column.key} className={column.className}>
          {column.cell(record)}
        </TableCell>
      ))}
    </TableRow>
  );
}
