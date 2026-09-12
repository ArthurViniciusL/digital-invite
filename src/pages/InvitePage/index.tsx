import { PageWrapper } from '@/components/layout/PageWrapper'
import { InviteHero } from '@/pages/InvitePage/partials/InviteHero'

/**
 * Public invite page, served at `/`.
 *
 * TODO: compose `EventDetails` and `RsvpForm` once they exist.
 */
export function InvitePage() {
  return (
    <PageWrapper>
      <InviteHero />
    </PageWrapper>
  )
}
