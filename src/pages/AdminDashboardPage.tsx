import { RsvpLoadError } from '@/components/admin/RsvpLoadError';
import { RsvpSummaryCard } from '@/components/admin/RsvpSummaryCard';
import { RsvpTable } from '@/components/admin/RsvpTable';
import { SignOutButton } from '@/components/admin/SignOutButton';
import { useRsvpList } from '@/hooks/useRsvpList';
import { summarizeRsvpList } from '@/lib/rsvp/summarizeRsvpList';

const pageTitle = 'Lista de convidados';
const pageSubtitle = 'Quem já confirmou presença:';

export function AdminDashboardPage() {
  const { rsvpList, isLoading, error } = useRsvpList();
  const summary = summarizeRsvpList(rsvpList);

  return (
    <div className="admin-theme w-dvw min-h-dvh px-4 py-10">
      <main className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 w-full">
            <div className='flex gap-6 flex-row items-baseline justify-between'>
              <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
              <SignOutButton />
            </div>
            <p className="text-muted-foreground text-sm">{pageSubtitle}</p>
          </div>
        </header>

        {error === null ? (
          <>
            <RsvpSummaryCard summary={summary} />
            <RsvpTable records={rsvpList} isLoading={isLoading} />
          </>
        ) : (
          <RsvpLoadError />
        )}
        <p className="text-muted-foreground text-sm">
          Arraste para visualizar os dados
        </p>
      </main>
    </div>
  );
}
