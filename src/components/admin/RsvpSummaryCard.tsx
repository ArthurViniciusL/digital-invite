import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { type RsvpSummary } from '@/lib/rsvp/summarizeRsvpList';

const guestsLabel = 'Total de convidados:';

interface RsvpSummaryCardProps {
  summary: RsvpSummary;
}

export function RsvpSummaryCard({ summary }: RsvpSummaryCardProps) {
  return (
    <Card className='max-w-fit'>
      <CardContent className="flex flex-row gap-4 items-center">
        <CardDescription>{guestsLabel}</CardDescription>
        <p className="text-3xl font-semibold tabular-nums">{summary.guestTotal}</p>
      </CardContent>
    </Card>
  );
}
