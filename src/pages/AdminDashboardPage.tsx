import { PageWrapper } from '@/components/layout/PageWrapper';
import { Title } from '@/components/typograph/Title';
import { RsvpSummaryCard } from '@/components/admin/RsvpSummaryCard';
import { RsvpTable } from '@/components/admin/RsvpTable';
import { rsvpListMock } from '@/lib/mocks/rsvpListMock';
import { summarizeRsvpList } from '@/lib/rsvp/summarizeRsvpList';

const pageTitle = 'Lista de convidados';
const pageSubtitle = 'Quem já confirmou presença:';

export function AdminDashboardPage() {
  const records = rsvpListMock;
  const isLoading = false;
  const summary = summarizeRsvpList(records);

  return (
    <PageWrapper>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-10">
        <header className="flex flex-col gap-2">
          <Title as="h1" className="font-title text-carved-black">
            {pageTitle}
          </Title>
          <p className="font-body text-xl text-sertao-brown">{pageSubtitle}</p>
        </header>

        <RsvpSummaryCard summary={summary} />
        <RsvpTable records={records} isLoading={isLoading} />
      </main>
    </PageWrapper>
  );
}
