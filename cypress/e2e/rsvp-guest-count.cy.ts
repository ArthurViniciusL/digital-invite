import { dialogSelector, rsvpLabels, rsvpMessages, rsvpText } from '../support/rsvp';

const maxGuestCount = 10;
const decreaseSelector = `${dialogSelector} button[aria-label="${rsvpText.decreaseButton}"]`;
const increaseSelector = `${dialogSelector} button[aria-label="${rsvpText.increaseButton}"]`;

function typeGuestCount(value: string): void {
  cy.rsvpField(rsvpLabels.guestCount).clear();
  cy.rsvpField(rsvpLabels.guestCount).type(value);
}

describe('RSVP guest count — stepper', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
    cy.openRsvpModal();
  });

  it('TC-COUNT-01 starts at 1 as a numeric text field with the decrement disabled', () => {
    cy.rsvpField(rsvpLabels.guestCount).should('have.value', '1');
    cy.rsvpField(rsvpLabels.guestCount).should('have.attr', 'type', 'text');
    cy.rsvpField(rsvpLabels.guestCount).should('have.attr', 'inputmode', 'numeric');
    cy.get(decreaseSelector).should('be.disabled');
    cy.get(increaseSelector).should('be.enabled');
  });

  it('TC-COUNT-02 increments without submitting the form', () => {
    cy.get(increaseSelector).click();
    cy.rsvpField(rsvpLabels.guestCount).should('have.value', '2');
    cy.get(decreaseSelector).should('be.enabled');
    cy.contains(`${dialogSelector} h2`, rsvpText.guestStepTitle).should('be.visible');
    cy.rsvpFieldMessage(rsvpLabels.name).should('not.exist');
    cy.get('@insertRsvp.all').should('have.length', 0);
  });

  it('TC-COUNT-03 stops at the ceiling of 10 with the increment disabled', () => {
    Cypress._.times(maxGuestCount - 1, () => {
      cy.get(increaseSelector).click();
    });
    cy.rsvpField(rsvpLabels.guestCount).should('have.value', String(maxGuestCount));
    cy.get(increaseSelector).should('be.disabled');
    cy.get(decreaseSelector).should('be.enabled');
  });

  it('TC-COUNT-04 decrements back to the floor of 1', () => {
    typeGuestCount('3');
    cy.get(decreaseSelector).click();
    cy.get(decreaseSelector).click();
    cy.rsvpField(rsvpLabels.guestCount).should('have.value', '1');
    cy.get(decreaseSelector).should('be.disabled');
  });
});

describe('RSVP guest count — typed values', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.openRsvpModal();
  });

  it('TC-COUNT-05 rejects a typed value above the ceiling', () => {
    typeGuestCount('50');
    cy.get(increaseSelector).should('be.disabled');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.guestCount).should('have.text', rsvpMessages.guestCountMax);
    cy.contains(`${dialogSelector} h2`, rsvpText.guestStepTitle).should('be.visible');
  });

  it('TC-COUNT-06 answers non-numeric input in Portuguese only', () => {
    typeGuestCount('ab');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.guestCount).should('have.text', rsvpMessages.guestCountType);
    cy.contains(dialogSelector, 'expected number').should('not.exist');
    cy.contains(dialogSelector, 'Invalid input').should('not.exist');
  });

  it('TC-COUNT-07 rejects a fractional value', () => {
    typeGuestCount('.5');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.guestCount).should('have.text', rsvpMessages.guestCountInt);
  });

  it('TC-COUNT-08 rejects zero with the minimum message', () => {
    typeGuestCount('0');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.guestCount).should('have.text', rsvpMessages.guestCountMin);
  });

  it('TC-COUNT-09 rejects an emptied field with the minimum message', () => {
    cy.rsvpField(rsvpLabels.guestCount).clear();
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.guestCount).should('have.text', rsvpMessages.guestCountMin);
  });

  it('TC-COUNT-10 clears a flagged count once the guest steps it back into range', () => {
    typeGuestCount('50');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.guestCount).should('have.text', rsvpMessages.guestCountMax);
    cy.get(decreaseSelector).click();
    cy.rsvpField(rsvpLabels.guestCount).should('have.value', String(maxGuestCount));
    cy.rsvpFieldMessage(rsvpLabels.guestCount).should('not.exist');
  });
});
