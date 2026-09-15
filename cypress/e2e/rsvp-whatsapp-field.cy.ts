import { dialogSelector, rsvpLabels, rsvpMessages, rsvpText } from '../support/rsvp';

describe('RSVP WhatsApp field — mask', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.openRsvpModal();
  });

  it('TC-WHATS-01 formats eleven typed digits', () => {
    cy.rsvpField(rsvpLabels.whatsapp).type('83987654321');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '83 9 8765-4321');
  });

  it('TC-WHATS-02 never shows a trailing separator on a partial number', () => {
    cy.rsvpField(rsvpLabels.whatsapp).type('83');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '83');
    cy.rsvpField(rsvpLabels.whatsapp).type('9');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '83 9');
    cy.rsvpField(rsvpLabels.whatsapp).type('8765');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '83 9 8765');
    cy.rsvpField(rsvpLabels.whatsapp).type('4');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '83 9 8765-4');
  });

  it('TC-WHATS-03 removes an orphaned separator with a single Backspace', () => {
    cy.rsvpField(rsvpLabels.whatsapp).type('839876');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '83 9 876');
    cy.rsvpField(rsvpLabels.whatsapp).type('5');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '83 9 8765');
    cy.rsvpField(rsvpLabels.whatsapp).type('{backspace}');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '83 9 876');
  });

  it('TC-WHATS-04 discards non-digit characters typed by the guest', () => {
    cy.rsvpField(rsvpLabels.whatsapp).type('(83) 98765-4321');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '83 9 8765-4321');
  });

  it('TC-WHATS-05 formats a pasted "(83) 98765-4321"', () => {
    cy.pasteIntoRsvpField(rsvpLabels.whatsapp, '(83) 98765-4321');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '83 9 8765-4321');
  });

  it('TC-WHATS-06 keeps only the first eleven digits', () => {
    cy.rsvpField(rsvpLabels.whatsapp).type('839876543219999');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '83 9 8765-4321');
  });
});

describe('RSVP WhatsApp field — mobile-only validation', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
    cy.openRsvpModal();
  });

  it('TC-WHATS-07 shows the required message, not the format one, when empty', () => {
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.whatsapp).should('have.text', rsvpMessages.whatsappRequired);
  });

  it('TC-WHATS-08 rejects a ten-digit landline', () => {
    cy.rsvpField(rsvpLabels.whatsapp).type('8333334444');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.whatsapp).should('have.text', rsvpMessages.whatsappFormat);
    cy.contains(`${dialogSelector} h2`, rsvpText.guestStepTitle).should('be.visible');
  });

  it('TC-WHATS-09 rejects an incomplete number', () => {
    cy.rsvpField(rsvpLabels.whatsapp).type('8398765');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.whatsapp).should('have.text', rsvpMessages.whatsappFormat);
  });

  it('TC-WHATS-10 rejects eleven digits without the mobile ninth digit', () => {
    cy.rsvpField(rsvpLabels.whatsapp).type('83887654321');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.whatsapp).should('have.text', rsvpMessages.whatsappFormat);
  });

  it('TC-WHATS-11 accepts an eleven-digit mobile number', () => {
    cy.rsvpField(rsvpLabels.whatsapp).type('83987654321');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.name).should('have.text', rsvpMessages.nameRequired);
    cy.rsvpFieldMessage(rsvpLabels.whatsapp).should('not.exist');
    cy.get('@insertRsvp.all').should('have.length', 0);
  });

  it('TC-WHATS-12 clears a flagged message while the guest completes the number', () => {
    cy.rsvpField(rsvpLabels.whatsapp).type('8398765');
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.whatsapp).should('have.text', rsvpMessages.whatsappFormat);
    cy.rsvpField(rsvpLabels.whatsapp).type('4321');
    cy.rsvpFieldMessage(rsvpLabels.whatsapp).should('not.exist');
  });
});
