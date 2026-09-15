import {
  dialogSelector,
  rsvpLabels,
  rsvpMessages,
  rsvpStorageKeys,
  rsvpText,
  successRegionSelector,
} from '../support/rsvp';

function expectStillOnGuestStep(): void {
  cy.contains(`${dialogSelector} h2`, rsvpText.guestStepTitle).should('be.visible');
  cy.get(successRegionSelector).should('not.exist');
  cy.rsvpStorageItem(rsvpStorageKeys.confirmed).should('be.null');
  cy.rsvpStorageItem(rsvpStorageKeys.name).should('be.null');
  cy.get('@insertRsvp.all').should('have.length', 0);
}

describe('RSVP validation — empty form', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
    cy.openRsvpModal();
  });

  it('TC-VALID-01 flags every required field in Portuguese and sends nothing', () => {
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.name).should('have.text', rsvpMessages.nameRequired);
    cy.rsvpFieldMessage(rsvpLabels.whatsapp).should('have.text', rsvpMessages.whatsappRequired);
    cy.rsvpFieldMessage(rsvpLabels.email).should('have.text', rsvpMessages.emailInvalid);
    cy.rsvpFieldMessage(rsvpLabels.guestCount).should('not.exist');
    cy.contains(dialogSelector, rsvpMessages.whatsappFormat).should('not.exist');
    cy.contains(dialogSelector, 'Invalid input').should('not.exist');
    expectStillOnGuestStep();
  });

  it('TC-VALID-02 shows no message on the first keystroke into an untouched field', () => {
    cy.rsvpField(rsvpLabels.name).type('M');
    cy.rsvpFieldMessage(rsvpLabels.name).should('not.exist');
  });

  it('TC-VALID-03 shows the name message when the field is blurred', () => {
    cy.rsvpField(rsvpLabels.name).type('M');
    cy.rsvpField(rsvpLabels.name).blur();
    cy.rsvpFieldMessage(rsvpLabels.name).should('have.text', rsvpMessages.nameRequired);
  });
});

describe('RSVP validation — name', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
    cy.openRsvpModal();
  });

  it('TC-VALID-04 treats a whitespace-only name as empty', () => {
    cy.rsvpField(rsvpLabels.name).type('     ');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.name).should('have.text', rsvpMessages.nameRequired);
    expectStillOnGuestStep();
  });

  it('TC-VALID-05 rejects a one-character name', () => {
    cy.rsvpField(rsvpLabels.name).type('M');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.name).should('have.text', rsvpMessages.nameRequired);
  });

  it('TC-VALID-06 accepts a two-character name', () => {
    cy.rsvpField(rsvpLabels.name).type('Mu');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.email).should('have.text', rsvpMessages.emailInvalid);
    cy.rsvpFieldMessage(rsvpLabels.name).should('not.exist');
  });

  it('TC-VALID-07 rejects a 61-character name and clears once it is 60', () => {
    cy.rsvpField(rsvpLabels.name).type('a'.repeat(61), { delay: 0 });
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.name).should('have.text', rsvpMessages.nameMax);
    cy.rsvpField(rsvpLabels.name).type('{backspace}');
    cy.rsvpFieldMessage(rsvpLabels.name).should('not.exist');
  });
});

describe('RSVP validation — e-mail', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
    cy.openRsvpModal();
  });

  it('TC-VALID-08 rejects a malformed e-mail', () => {
    cy.rsvpField(rsvpLabels.email).type('maria@');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.email).should('have.text', rsvpMessages.emailInvalid);
    expectStillOnGuestStep();
  });

  it('TC-VALID-09 clears a flagged e-mail message while the guest fixes it', () => {
    cy.rsvpField(rsvpLabels.email).type('maria@');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.email).should('have.text', rsvpMessages.emailInvalid);
    cy.rsvpField(rsvpLabels.email).type('example.com');
    cy.rsvpFieldMessage(rsvpLabels.email).should('not.exist');
  });
});
