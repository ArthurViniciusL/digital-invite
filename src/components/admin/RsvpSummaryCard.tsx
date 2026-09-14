import { cn } from '@/lib/utils';
import { type RsvpSummary } from '@/lib/rsvp/summarizeRsvpList';

const confirmationsLabel = 'Confirmações';
const guestsLabel = 'Total de convidados';

const labelClassName = 'font-title text-sm tracking-wide text-sertao-brown uppercase';
const countClassName = 'font-title text-4xl text-carved-black sm:text-5xl';
const figureClassName =
  'flex flex-col gap-2 border-b-2 border-sertao-brown px-5 py-5 last:border-b-0 sm:border-r-2 sm:border-b-0 sm:last:border-r-0';

interface RsvpSummaryCardProps {
  summary: RsvpSummary;
}

export function RsvpSummaryCard({ summary }: RsvpSummaryCardProps) {
  return (
    <article
      className={cn(
        'carved-2 border-4 border-carved-black bg-bone-white',
        'grid grid-cols-1 px-2 py-2 sm:grid-cols-3',
      )}
    >
      <div className={figureClassName}>
        <p className={labelClassName}>{confirmationsLabel}</p>
        <p className={countClassName}>{summary.confirmationCount}</p>
      </div>
      <div className={figureClassName}>
        <p className={labelClassName}>{guestsLabel}</p>
        <p className={countClassName}>{summary.guestTotal}</p>
      </div>
    </article>
  );
}
