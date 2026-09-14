import { type RsvpRecord } from '@/lib/schemas/rsvpSchema';

export interface RsvpSummary {
  confirmationCount: number;
  guestTotal: number;
  lastConfirmationAt: string | null;
}

function isMoreRecent(candidate: string, current: string | null): boolean {
  if (current === null) {
    return true;
  }

  return Date.parse(candidate) > Date.parse(current);
}

export function summarizeRsvpList(records: RsvpRecord[]): RsvpSummary {
  return records.reduce<RsvpSummary>(
    (summary, record) => ({
      confirmationCount: summary.confirmationCount + 1,
      guestTotal: summary.guestTotal + record.guestCount,
      lastConfirmationAt: isMoreRecent(record.createdAt, summary.lastConfirmationAt)
        ? record.createdAt
        : summary.lastConfirmationAt,
    }),
    {
      confirmationCount: 0,
      guestTotal: 0,
      lastConfirmationAt: null,
    },
  );
}
