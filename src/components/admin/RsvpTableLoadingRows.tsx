import { TableCell, TableRow } from '@/components/ui/table';

const PLACEHOLDER_ROWS = [0, 1, 2];
const PLACEHOLDER_WIDTHS = ['w-32', 'w-8', 'w-28', 'w-40', 'w-24', 'w-20'];

export function RsvpTableLoadingRows() {
  return (
    <>
      {PLACEHOLDER_ROWS.map((row) => (
        <TableRow key={row}>
          {PLACEHOLDER_WIDTHS.map((width) => (
            <TableCell key={width}>
              <span className={`bg-muted block h-4 animate-pulse rounded ${width}`} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
