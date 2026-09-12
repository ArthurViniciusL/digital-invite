import { InviteHero } from '@/components/invite/InviteHero'
import { PageWrapper } from '@/components/layout/PageWrapper'

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
