import {
  dialogSelector,
  insertAlias,
  rsvpEndpoint,
  rsvpLabels,
  rsvpMessages,
  rsvpStorageKeys,
  rsvpText,
  successRegionSelector,
  toExpectedRow,
  toastSelector,
  type RsvpGuest,
} from '../support/rsvp';

function attemptRsvp(guest: RsvpGuest): void {
  cy.openRsvpModal();
  cy.fillRsvpForm(guest);
  cy.confirmRsvpForm();
  cy.wait(`@${insertAlias}`);
}

function expectFailedAttempt(guest: RsvpGuest, message: string): void {
  cy.contains(toastSelector, message).should('be.visible');
  cy.contains(`${dialogSelector} h2`, rsvpText.guestStepTitle).should('be.visible');
  cy.contains(`${dialogSelector} button`, rsvpText.submitButton).should('be.enabled');
  cy.rsvpField(rsvpLabels.name).should('have.value', guest.name);
  cy.rsvpField(rsvpLabels.email).should('have.value', guest.email);
  cy.get(successRegionSelector).should('not.exist');
  cy.rsvpStorageItem(rsvpStorageKeys.confirmed).should('be.null');
  cy.rsvpStorageItem(rsvpStorageKeys.name).should('be.null');
}

describe('RSVP insert failures — stubbed responses', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('TC-FAIL-01 shows the duplicate e-mail toast on a unique violation', () => {
    cy.intercept('POST', rsvpEndpoint, {
      statusCode: 409,
      body: {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
        details: null,
        hint: null,
      },
    }).as(insertAlias);
    cy.rsvpGuest().then((guest) => {
      attemptRsvp(guest);
      expectFailedAttempt(guest, rsvpMessages.duplicateEmail);
    });
  });

  it('TC-FAIL-02 shows the generic toast on a server error', () => {
    cy.intercept('POST', rsvpEndpoint, {
      statusCode: 500,
      body: {
        code: 'XX000',
        message: 'internal error',
        details: null,
        hint: null,
      },
    }).as(insertAlias);
    cy.rsvpGuest().then((guest) => {
      attemptRsvp(guest);
      expectFailedAttempt(guest, rsvpMessages.submitError);
    });
  });

  it('TC-FAIL-03 shows the generic toast when the network fails', () => {
    cy.intercept('POST', rsvpEndpoint, { forceNetworkError: true }).as(insertAlias);
    cy.rsvpGuest().then((guest) => {
      attemptRsvp(guest);
      expectFailedAttempt(guest, rsvpMessages.submitError);
    });
  });
});

describe('RSVP insert failures — local database', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
  });

  it('TC-FAIL-04 rejects a second RSVP with the same e-mail and keeps one row', () => {
    cy.rsvpGuest().then((guest) => {
      cy.submitRsvp(guest);
      cy.contains(`${dialogSelector} button`, rsvpText.calendarDecline).click();
      cy.clearLocalStorage();
      cy.reload();
      attemptRsvp(guest);
      expectFailedAttempt(guest, rsvpMessages.duplicateEmail);
      cy.readRsvpRows(toExpectedRow(guest).email).should('have.length', 1);
    });
  });
});
