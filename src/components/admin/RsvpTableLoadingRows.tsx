import { TableCell, TableRow } from '@/components/ui/table';
import { RSVP_COLUMNS } from './rsvpColumns';

const PLACEHOLDER_ROWS = [0, 1, 2];

export function RsvpTableLoadingRows() {
  return (
    <>
      {PLACEHOLDER_ROWS.map((row) => (
        <TableRow key={row}>
          {RSVP_COLUMNS.map((column) => (
            <TableCell key={column.key}>
              <span
                className={`bg-muted block h-4 animate-pulse rounded ${column.placeholderWidth}`}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
