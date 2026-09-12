import { PageWrapper } from '@/components/layout/PageWrapper'
import { EventDetails } from './partials/EventDetails'
import { InviteHero } from './partials/InviteHero'

/**
 * Public invite page, served at `/`.
 *
 * TODO: compose `RsvpForm` once it exists.
 */
export function InvitePage() {
  return (
    <PageWrapper>
      <InviteHero />
      <EventDetails />
    </PageWrapper>
  )
}
