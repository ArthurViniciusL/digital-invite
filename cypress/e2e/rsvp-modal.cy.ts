import {
  dialogSelector,
  rsvpLabels,
  rsvpMessages,
  rsvpStorageKeys,
  rsvpText,
  successRegionSelector,
} from '../support/rsvp';

const closeButtonSelector = `${dialogSelector} button[aria-label="${rsvpText.closeButton}"]`;

function textsOf($elements: JQuery<HTMLElement>): string[] {
  return $elements.toArray().map((element) => element.textContent?.trim() ?? '');
}

function expectBackedOut(): void {
  cy.get(dialogSelector).should('not.exist');
  cy.contains('button', rsvpText.confirmationButton).should('be.visible');
  cy.get(successRegionSelector).should('not.exist');
  cy.rsvpStorageItem(rsvpStorageKeys.confirmed).should('be.null');
  cy.rsvpStorageItem(rsvpStorageKeys.name).should('be.null');
  cy.get('@insertRsvp.all').should('have.length', 0);
}

function expectEmptyForm(): void {
  cy.rsvpField(rsvpLabels.name).should('have.value', '');
  cy.rsvpField(rsvpLabels.whatsapp).should('have.value', '');
  cy.rsvpField(rsvpLabels.email).should('have.value', '');
  cy.rsvpField(rsvpLabels.guestCount).should('have.value', '1');
}

describe('RSVP modal — opening and content', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
  });

  it('TC-MODAL-01 opens the guest step from the confirmation button', () => {
    cy.get(dialogSelector).should('not.exist');
    cy.openRsvpModal();
    cy.get(dialogSelector).should('have.length', 1);
  });

  it('TC-MODAL-02 renders the four labelled fields in order with their defaults', () => {
    cy.openRsvpModal();
    cy.get(`${dialogSelector} label`)
      .then(textsOf)
      .should('deep.equal', ['Seu nome: *', 'Whatsapp: *', 'E-mail: *', 'Quantidade de convites']);
    expectEmptyForm();
    cy.rsvpField(rsvpLabels.name).should('have.attr', 'placeholder', 'Nome e Sobrenome');
    cy.rsvpField(rsvpLabels.whatsapp).should('have.attr', 'placeholder', '(xx) x xxxx-xxxx');
    cy.rsvpField(rsvpLabels.email).should('have.attr', 'placeholder', '@gmail.com');
    cy.contains(`${dialogSelector} button`, rsvpText.submitButton).should('be.visible');
    cy.get(closeButtonSelector).should('be.visible');
  });

  it('TC-MODAL-03 ignores query parameters when filling the form', () => {
    cy.visit('/?name=Fulano&email=fulano%40example.com&whatsapp=83987654321');
    cy.openRsvpModal();
    expectEmptyForm();
  });

  it('TC-MODAL-04 submits the form when Enter is pressed inside a field', () => {
    cy.openRsvpModal();
    cy.rsvpField(rsvpLabels.name).type('{enter}');
    cy.rsvpFieldMessage(rsvpLabels.name).should('have.text', rsvpMessages.nameRequired);
    cy.contains(`${dialogSelector} h2`, rsvpText.guestStepTitle).should('be.visible');
  });
});

describe('RSVP modal — backing out without submitting', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
    cy.openRsvpModal();
    cy.rsvpField(rsvpLabels.name).type('Maria');
  });

  it('TC-MODAL-05 closes from the corner "Fechar" control', () => {
    cy.get(closeButtonSelector).click();
    expectBackedOut();
  });

  it('TC-MODAL-06 closes on Escape', () => {
    cy.get('body').type('{esc}');
    expectBackedOut();
  });

  it('TC-MODAL-07 closes on a click on the overlay', () => {
    cy.get('[data-slot="dialog-overlay"]').click('topLeft', { force: true });
    expectBackedOut();
  });
});

describe('RSVP modal — values across close and reload', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
  });

  it('TC-MODAL-08 keeps filled values after closing and reopening', () => {
    cy.rsvpGuest().then((guest) => {
      cy.openRsvpModal();
      cy.fillRsvpForm(guest);
      cy.get(closeButtonSelector).click();
      expectBackedOut();
      cy.openRsvpModal();
      cy.rsvpField(rsvpLabels.name).should('have.value', guest.name);
      cy.rsvpField(rsvpLabels.whatsapp).should('have.value', guest.whatsappMasked);
      cy.rsvpField(rsvpLabels.email).should('have.value', guest.email);
      cy.rsvpField(rsvpLabels.guestCount).should('have.value', String(guest.guestCount));
    });
  });

  it('TC-MODAL-09 empties the form after a reload', () => {
    cy.rsvpGuest().then((guest) => {
      cy.openRsvpModal();
      cy.fillRsvpForm(guest);
      cy.get(closeButtonSelector).click();
      cy.reload();
      cy.openRsvpModal();
      expectEmptyForm();
    });
  });
});

describe('RSVP modal — 320px viewport', () => {
  beforeEach(() => {
    cy.viewport(320, 568);
    cy.interceptRsvpInsert();
    cy.visit('/');
  });

  it('TC-MODAL-10 fits the panel and keeps "Confirmar" reachable with errors shown', () => {
    cy.openRsvpModal();
    cy.get(dialogSelector).then(($dialog) => {
      const bounds = $dialog[0].getBoundingClientRect();

      expect(bounds.left).to.be.at.least(0);
      expect(bounds.right).to.be.at.most(320);
    });
    cy.confirmRsvpForm();
    cy.rsvpFieldMessage(rsvpLabels.email).should('have.text', rsvpMessages.emailInvalid);
    cy.contains(`${dialogSelector} button`, rsvpText.submitButton).scrollIntoView();
    cy.contains(`${dialogSelector} button`, rsvpText.submitButton).should('be.visible');
    cy.document().its('documentElement.scrollWidth').should('be.at.most', 320);
  });
});
