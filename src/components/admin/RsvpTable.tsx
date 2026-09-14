import { MoveHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';
import { type RsvpRecord } from '@/lib/schemas/rsvpSchema';
import { RsvpTableEmpty } from './RsvpTableEmpty';
import { RsvpTableLoadingRows } from './RsvpTableLoadingRows';
import { RsvpTableRow } from './RsvpTableRow';

const tableHeading = 'Confirmações';
const tableCaption = 'Lista de convidados que confirmaram presença na festa.';
const tableRegionLabel = 'Tabela de confirmações';
const scrollHint = 'Arraste para o lado para ver todas as colunas.';
const loadingMessage = 'Carregando confirmações.';

const COLUMNS = [
  { label: 'Nome', className: 'min-w-48 text-left' },
  { label: 'Pessoas', className: 'min-w-20 text-right' },
  { label: 'WhatsApp', className: 'min-w-36 text-left' },
  { label: 'E-mail', className: 'min-w-56 text-left' },
  { label: 'Confirmado em', className: 'min-w-36 text-left' },
  { label: 'Status', className: 'min-w-28 text-left' },
];

const headerCellClassName =
  'px-4 py-3 font-title text-sm tracking-wide whitespace-nowrap text-sertao-brown uppercase';

function RsvpTableHead() {
  return (
    <thead>
      <tr className="border-b-4 border-carved-black">
        {COLUMNS.map((column) => (
          <th key={column.label} scope="col" className={cn(headerCellClassName, column.className)}>
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

interface RsvpTableProps {
  records: RsvpRecord[];
  isLoading?: boolean;
}

export function RsvpTable({ records, isLoading = false }: RsvpTableProps) {
  const isEmpty = !isLoading && records.length === 0;

  return (
    <section className="carved-1 border-4 border-carved-black bg-bone-white px-5 py-6 sm:px-10 sm:py-8">
      <h2 className="font-title text-2xl text-carved-black sm:text-3xl">{tableHeading}</h2>

      {isEmpty ? (
        <RsvpTableEmpty />
      ) : (
        <>
          <div
            role="region"
            aria-label={tableRegionLabel}
            aria-busy={isLoading}
            tabIndex={0}
            className={cn(
              'mt-6 overflow-x-auto rounded-none',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-carved-black',
            )}
          >
            {isLoading && <p className="sr-only">{loadingMessage}</p>}
            <table className="w-full min-w-max border-collapse">
              <caption className="sr-only">{tableCaption}</caption>
              <RsvpTableHead />
              <tbody>
                {isLoading ? (
                  <RsvpTableLoadingRows />
                ) : (
                  records.map((record) => <RsvpTableRow key={record.id} record={record} />)
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 flex items-center gap-2 font-body text-base text-sertao-brown sm:hidden">
            <MoveHorizontal aria-hidden className="size-4" />
            {scrollHint}
          </p>
        </>
      )}
    </section>
  );
}
