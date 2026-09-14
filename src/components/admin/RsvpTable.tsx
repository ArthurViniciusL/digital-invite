import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type RsvpRecord } from '@/lib/schemas/rsvpSchema';
import { RsvpTableEmpty } from './RsvpTableEmpty';
import { RsvpTableLoadingRows } from './RsvpTableLoadingRows';
import { RsvpTableRow } from './RsvpTableRow';

const tableHeading = 'Convidados';
const tableCaption = 'Lista de convidados que confirmaram presença na festa.';
const loadingMessage = 'Carregando confirmações.';

const COLUMNS = [
  { label: 'Nome', className: '' },
  { label: 'Pessoas', className: 'text-right' },
  { label: 'WhatsApp', className: '' },
  { label: 'E-mail', className: '' },
  { label: 'Confirmado em', className: '' },
];

interface RsvpTableProps {
  records: RsvpRecord[];
  isLoading?: boolean;
}

export function RsvpTable({ records, isLoading = false }: RsvpTableProps) {
  const isEmpty = !isLoading && records.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tableHeading}</CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <RsvpTableEmpty />
        ) : (
          <div aria-busy={isLoading}>
            {isLoading && <p className="sr-only">{loadingMessage}</p>}
            <Table>
              <TableCaption className="sr-only">{tableCaption}</TableCaption>
              <TableHeader>
                <TableRow>
                  {COLUMNS.map((column) => (
                    <TableHead key={column.label} className={column.className}>
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <RsvpTableLoadingRows />
                ) : (
                  records.map((record) => <RsvpTableRow key={record.id} record={record} />)
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
