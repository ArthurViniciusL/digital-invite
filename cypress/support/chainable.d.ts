import type { Interception } from 'cypress/types/net-stubbing';

import type { RsvpDbRow, RsvpGuest } from './rsvp';

declare global {
  namespace Cypress {
    interface Chainable {
      revealConfirmationButton(): Chainable<JQuery<HTMLButtonElement>>;
      openRsvpModal(): Chainable<JQuery<HTMLElement>>;
      rsvpField(label: string): Chainable<JQuery<HTMLInputElement>>;
      rsvpFieldMessage(label: string): Chainable<JQuery<HTMLElement>>;
      pasteIntoRsvpField(label: string, text: string): Chainable<JQuery<HTMLInputElement>>;
      rsvpGuest(overrides?: Partial<RsvpGuest>): Chainable<RsvpGuest>;
      fillRsvpForm(guest: RsvpGuest): Chainable<void>;
      confirmRsvpForm(): Chainable<void>;
      interceptRsvpInsert(): Chainable<null>;
      submitRsvp(guest: RsvpGuest): Chainable<JQuery<HTMLElement>>;
      expectRsvpInsertRequest(guest: RsvpGuest): Chainable<Interception>;
      readRsvpRows(email: string): Chainable<RsvpDbRow[]>;
      rsvpStorageItem(key: string): Chainable<string | null>;
    }
  }
}
