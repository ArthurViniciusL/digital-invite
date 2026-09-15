import type { Interception } from 'cypress/types/net-stubbing';

import {
  dialogSelector,
  insertAlias,
  rsvpEndpoint,
  rsvpLabels,
  rsvpText,
  toExpectedRow,
  type AdminCredentials,
  type RsvpDbRow,
  type RsvpGuest,
} from './rsvp';

interface SupabaseTarget {
  origin: string;
  apikey: string;
}

interface TokenResponse {
  access_token: string;
}

function uniqueEmail(email: string): string {
  return email.replace('@', `.${Date.now()}@`);
}

function pasteRespectingMaxLength(input: HTMLInputElement, text: string): void {
  const view = input.ownerDocument.defaultView;

  if (view === null) {
    return;
  }

  const room = input.maxLength >= 0 ? input.maxLength - input.value.length : text.length;
  const pastedValue = input.value + text.slice(0, Math.max(room, 0));

  Reflect.set(view.HTMLInputElement.prototype, 'value', pastedValue, input);
  input.dispatchEvent(new view.Event('input', { bubbles: true }));
}

function supabaseTargetOf(insert: Interception): SupabaseTarget {
  const { apikey } = insert.request.headers;

  return {
    origin: new URL(insert.request.url).origin,
    apikey: Array.isArray(apikey) ? apikey[0] : apikey,
  };
}

function signInAsAdmin(target: SupabaseTarget): Cypress.Chainable<string> {
  return cy.fixture<AdminCredentials>('admin').then((admin) =>
    cy
      .request<TokenResponse>({
        method: 'POST',
        url: `${target.origin}/auth/v1/token?grant_type=password`,
        headers: { apikey: target.apikey },
        body: {
          email: `${admin.username}@${admin.emailDomain}`,
          password: admin.password,
        },
      })
      .then((response) => response.body.access_token),
  );
}

function fetchRowsByEmail(target: SupabaseTarget, token: string, email: string) {
  return cy
    .request<RsvpDbRow[]>({
      url: `${target.origin}/rest/v1/rsvp`,
      qs: {
        select: 'nome,email,whatsapp,numero_pessoas',
        email: `eq.${email}`,
      },
      headers: {
        apikey: target.apikey,
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => response.body);
}

Cypress.Commands.add('revealConfirmationButton', () => {
  cy.contains('button', rsvpText.confirmationButton).scrollIntoView();

  return cy.contains('button', rsvpText.confirmationButton);
});

Cypress.Commands.add('openRsvpModal', () => {
  cy.revealConfirmationButton().click();

  return cy.contains(`${dialogSelector} h2`, rsvpText.guestStepTitle).should('be.visible');
});

Cypress.Commands.add('rsvpField', (label: string) =>
  cy
    .contains(`${dialogSelector} label`, label)
    .then(($label) => cy.get<HTMLInputElement>(`#${CSS.escape($label.attr('for') ?? '')}`)),
);

Cypress.Commands.add('rsvpFieldMessage', (label: string) =>
  cy.rsvpField(label).closest('[data-slot="form-item"]').find('[data-slot="form-message"]'),
);

Cypress.Commands.add('pasteIntoRsvpField', (label: string, text: string) =>
  cy.rsvpField(label).then(($input) => {
    pasteRespectingMaxLength($input[0], text);

    return $input;
  }),
);

Cypress.Commands.add('rsvpGuest', (overrides: Partial<RsvpGuest> = {}) =>
  cy.fixture<RsvpGuest>('rsvp-guest').then((template) => ({
    ...template,
    ...overrides,
    email: overrides.email ?? uniqueEmail(template.email),
  })),
);

Cypress.Commands.add('fillRsvpForm', (guest: RsvpGuest) => {
  cy.rsvpField(rsvpLabels.name).clear();
  cy.rsvpField(rsvpLabels.name).type(guest.name);
  cy.rsvpField(rsvpLabels.whatsapp).clear();
  cy.rsvpField(rsvpLabels.whatsapp).type(guest.whatsappDigits);
  cy.rsvpField(rsvpLabels.email).clear();
  cy.rsvpField(rsvpLabels.email).type(guest.email);
  cy.rsvpField(rsvpLabels.guestCount).clear();
  cy.rsvpField(rsvpLabels.guestCount).type(String(guest.guestCount));
});

Cypress.Commands.add('confirmRsvpForm', () => {
  cy.contains(`${dialogSelector} button`, new RegExp(`^${rsvpText.submitButton}$`)).click();
});

Cypress.Commands.add('interceptRsvpInsert', () => cy.intercept('POST', rsvpEndpoint).as(insertAlias));

Cypress.Commands.add('submitRsvp', (guest: RsvpGuest) => {
  cy.openRsvpModal();
  cy.fillRsvpForm(guest);
  cy.confirmRsvpForm();
  cy.wait(`@${insertAlias}`);

  return cy.contains(`${dialogSelector} h2`, rsvpText.calendarStepTitle).should('be.visible');
});

Cypress.Commands.add('expectRsvpInsertRequest', (guest: RsvpGuest) =>
  cy.get<Interception>(`@${insertAlias}`).then((insert) => {
    expect(insert.request.body).to.deep.equal(toExpectedRow(guest));
    expect(insert.response?.statusCode).to.equal(201);

    return insert;
  }),
);

Cypress.Commands.add('readRsvpRows', (email: string) =>
  cy.get<Interception>(`@${insertAlias}`).then((insert) => {
    const target = supabaseTargetOf(insert);

    return signInAsAdmin(target).then((token) => fetchRowsByEmail(target, token, email));
  }),
);

Cypress.Commands.add('rsvpStorageItem', (key: string) =>
  cy.window().its('localStorage').invoke('getItem', key),
);
