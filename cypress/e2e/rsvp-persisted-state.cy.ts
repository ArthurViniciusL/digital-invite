import {
  confettiSelector,
  dialogSelector,
  feedbackFor,
  rsvpMessages,
  rsvpStorageKeys,
  rsvpText,
  successRegionSelector,
  toExpectedRow,
  toastSelector,
} from '../support/rsvp';

function visitWithStorage(entries: Record<string, string>): void {
  cy.visit('/', {
    onBeforeLoad: (win) => {
      Object.entries(entries).forEach(([key, value]) => win.localStorage.setItem(key, value));
    },
  });
}

function denyStorageWrites(win: Cypress.AUTWindow): void {
  cy.stub(win.Storage.prototype, 'setItem').throws(new Error('storage denied'));
}

function denyStorageReads(win: Cypress.AUTWindow): void {
  cy.stub(win.Storage.prototype, 'getItem').throws(new Error('storage denied'));
}

describe('RSVP persisted state — after a real confirmation', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
  });

  it('TC-STATE-01 restores the greeting on reload without confetti or a new insert', () => {
    cy.rsvpGuest().then((guest) => {
      cy.submitRsvp(guest);
      cy.contains(`${dialogSelector} button`, rsvpText.calendarDecline).click();
      cy.get(confettiSelector).should('exist');
      cy.reload();
      cy.contains(successRegionSelector, feedbackFor(guest.firstName)).should('be.visible');
      cy.get(confettiSelector).should('not.exist');
      cy.contains('button', rsvpText.confirmationButton).should('not.exist');
      cy.get('@insertRsvp.all').should('have.length', 1);
      cy.readRsvpRows(toExpectedRow(guest).email).should('have.length', 1);
    });
  });

  it('TC-STATE-02 keeps the 320px layout free of horizontal overflow after confirming', () => {
    cy.viewport(320, 568);
    cy.rsvpGuest().then((guest) => {
      cy.submitRsvp(guest);
      cy.contains(`${dialogSelector} button`, rsvpText.calendarDecline).click();
      cy.contains(successRegionSelector, feedbackFor(guest.firstName)).should('be.visible');
      cy.get(successRegionSelector).should('have.css', 'opacity', '1');
      cy.document().its('documentElement.scrollWidth').should('be.at.most', 320);
    });
  });
});

describe('RSVP persisted state — seeded storage', () => {
  it('TC-STATE-03 greets a returning guest by the stored first name', () => {
    visitWithStorage({
      [rsvpStorageKeys.confirmed]: 'true',
      [rsvpStorageKeys.name]: 'João Pedro',
    });
    cy.contains(successRegionSelector, feedbackFor('João')).should('be.visible');
    cy.get(confettiSelector).should('not.exist');
    cy.contains('button', rsvpText.confirmationButton).should('not.exist');
  });

  it('TC-STATE-04 shows the fallback message when the flag has no name', () => {
    visitWithStorage({ [rsvpStorageKeys.confirmed]: 'true' });
    cy.contains(successRegionSelector, rsvpMessages.feedbackFallback).should('be.visible');
    cy.contains(successRegionSelector, 'Tá confirmado').should('not.exist');
    cy.contains('button', rsvpText.confirmationButton).should('not.exist');
  });

  it('TC-STATE-05 shows the fallback message when the stored name is whitespace only', () => {
    visitWithStorage({
      [rsvpStorageKeys.confirmed]: 'true',
      [rsvpStorageKeys.name]: '   ',
    });
    cy.contains(successRegionSelector, rsvpMessages.feedbackFallback).should('be.visible');
  });

  it('TC-STATE-06 ignores a stored name when the flag is not exactly "true"', () => {
    visitWithStorage({
      [rsvpStorageKeys.confirmed]: 'yes',
      [rsvpStorageKeys.name]: 'João Pedro',
    });
    cy.revealConfirmationButton().should('be.visible');
    cy.get(successRegionSelector).should('not.exist');
    cy.contains('João').should('not.exist');
  });
});

describe('RSVP persisted state — storage failures', () => {
  it('TC-STATE-07 renders the confirmation button when storage reads throw', () => {
    cy.visit('/', { onBeforeLoad: denyStorageReads });
    cy.revealConfirmationButton().should('be.visible');
  });

  it('TC-STATE-08 still greets the guest when storage writes throw', () => {
    cy.interceptRsvpInsert();
    cy.visit('/', { onBeforeLoad: denyStorageWrites });
    cy.rsvpGuest().then((guest) => {
      cy.submitRsvp(guest);
      cy.contains(`${dialogSelector} button`, rsvpText.calendarDecline).click();
      cy.contains(successRegionSelector, feedbackFor(guest.firstName)).should('be.visible');
      cy.get(toastSelector).should('not.exist');
      cy.reload();
      cy.revealConfirmationButton().should('be.visible');
    });
  });
});
