import { PageWrapper } from '@/components/layout/PageWrapper';
import { EventDetails } from './partials/EventDetails';
import { InviteHero } from './partials/InviteHero';
import { RsvpForm } from './partials/RsvpForm';

export function InvitePage() {
  return (
    <PageWrapper>
      <InviteHero />
      <EventDetails />
      <RsvpForm />
    </PageWrapper>
  );
}
