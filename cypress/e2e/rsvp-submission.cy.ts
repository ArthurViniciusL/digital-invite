import {
  confettiSelector,
  dialogSelector,
  feedbackFor,
  insertAlias,
  rsvpEndpoint,
  rsvpLabels,
  rsvpMessages,
  rsvpStorageKeys,
  rsvpText,
  successRegionSelector,
  toExpectedRow,
  type RsvpGuest,
} from '../support/rsvp';

const closeButtonSelector = `${dialogSelector} button[aria-label="${rsvpText.closeButton}"]`;

function expectFreshConfirmation(guest: RsvpGuest): void {
  cy.get(dialogSelector).should('not.exist');
  cy.contains(successRegionSelector, feedbackFor(guest.firstName)).should('be.visible');
  cy.get(confettiSelector).should('exist');
  cy.contains('button', rsvpText.confirmationButton).should('not.exist');
  cy.rsvpStorageItem(rsvpStorageKeys.confirmed).should('equal', 'true');
  cy.rsvpStorageItem(rsvpStorageKeys.name).should('equal', guest.name.trim());
}

function blockNewTab($link: JQuery<HTMLElement>): void {
  $link.on('click', (event) => event.preventDefault());
}

describe('RSVP submission — insert into Supabase', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
  });

  it('TC-SUBMIT-01 writes exactly one row mapped to the Portuguese columns', () => {
    cy.rsvpGuest().then((guest) => {
      cy.submitRsvp(guest);
      cy.expectRsvpInsertRequest(guest);
      cy.get('@insertRsvp.all').should('have.length', 1);
      cy.readRsvpRows(toExpectedRow(guest).email).should('deep.equal', [toExpectedRow(guest)]);
    });
  });

  it('TC-SUBMIT-02 stores a trimmed single-word name and greets with it', () => {
    cy.rsvpGuest({ name: '  Muricarliton  ', firstName: 'Muricarliton' }).then((guest) => {
      cy.submitRsvp(guest);
      cy.expectRsvpInsertRequest(guest);
      cy.contains(`${dialogSelector} button`, rsvpText.calendarDecline).click();
      expectFreshConfirmation(guest);
    });
  });

  it('TC-SUBMIT-03 advances to the calendar step and persists the confirmation right away', () => {
    cy.rsvpGuest().then((guest) => {
      cy.submitRsvp(guest);
      cy.get(`${dialogSelector} form`).should('not.exist');
      cy.contains(`${dialogSelector} a`, rsvpText.calendarAccept).should('be.visible');
      cy.contains(`${dialogSelector} button`, rsvpText.calendarDecline).should('be.visible');
      cy.contains('button', rsvpText.confirmationButton).should('exist');
      cy.get(successRegionSelector).should('not.exist');
      cy.rsvpStorageItem(rsvpStorageKeys.confirmed).should('equal', 'true');
      cy.rsvpStorageItem(rsvpStorageKeys.name).should('equal', guest.name.trim());
    });
  });

  it('TC-SUBMIT-04 sends no insert request when a field is invalid', () => {
    cy.rsvpGuest({ email: 'maria@' }).then((guest) => {
      cy.openRsvpModal();
      cy.fillRsvpForm(guest);
      cy.confirmRsvpForm();
      cy.rsvpFieldMessage(rsvpLabels.email).should('have.text', rsvpMessages.emailInvalid);
      cy.get(`@${insertAlias}.all`).should('have.length', 0);
    });
  });
});

describe('RSVP submission — pending state', () => {
  beforeEach(() => {
    cy.intercept('POST', rsvpEndpoint, { statusCode: 201, delay: 1500 }).as(insertAlias);
    cy.visit('/');
  });

  it('TC-SUBMIT-05 disables "Confirmar" and blocks closing while the insert is pending', () => {
    cy.rsvpGuest().then((guest) => {
      cy.openRsvpModal();
      cy.fillRsvpForm(guest);
      cy.confirmRsvpForm();
      cy.contains(`${dialogSelector} button`, rsvpText.submittingButton).should('be.disabled');
      cy.contains(`${dialogSelector} button`, rsvpText.submittingButton).should(
        'have.attr',
        'aria-busy',
        'true',
      );
      cy.get('body').type('{esc}');
      cy.get(dialogSelector).should('exist');
      cy.wait(`@${insertAlias}`);
      cy.contains(`${dialogSelector} h2`, rsvpText.calendarStepTitle).should('be.visible');
    });
  });
});

describe('RSVP submission — calendar step exits confirm', () => {
  beforeEach(() => {
    cy.interceptRsvpInsert();
    cy.visit('/');
  });

  it('TC-SUBMIT-06 confirms on "NÃO"', () => {
    cy.rsvpGuest().then((guest) => {
      cy.submitRsvp(guest);
      cy.contains(`${dialogSelector} button`, rsvpText.calendarDecline).click();
      expectFreshConfirmation(guest);
    });
  });

  it('TC-SUBMIT-07 confirms on the corner "Fechar" control', () => {
    cy.rsvpGuest().then((guest) => {
      cy.submitRsvp(guest);
      cy.get(closeButtonSelector).click();
      expectFreshConfirmation(guest);
    });
  });

  it('TC-SUBMIT-08 confirms on Escape', () => {
    cy.rsvpGuest().then((guest) => {
      cy.submitRsvp(guest);
      cy.get('body').type('{esc}');
      expectFreshConfirmation(guest);
    });
  });

  it('TC-SUBMIT-09 confirms on a click on the overlay', () => {
    cy.rsvpGuest().then((guest) => {
      cy.submitRsvp(guest);
      cy.get('[data-slot="dialog-overlay"]').click('topLeft', { force: true });
      expectFreshConfirmation(guest);
    });
  });

  it('TC-SUBMIT-10 confirms on "SIM", which targets Google Calendar in a new tab', () => {
    cy.rsvpGuest().then((guest) => {
      cy.submitRsvp(guest);
      cy.contains(`${dialogSelector} a`, rsvpText.calendarAccept)
        .should('have.attr', 'href')
        .and('match', /^https:\/\/calendar\.google\.com\/calendar\/render\?/);
      cy.contains(`${dialogSelector} a`, rsvpText.calendarAccept)
        .should('have.attr', 'target', '_blank')
        .and('have.attr', 'rel')
        .and('include', 'noopener');
      cy.contains(`${dialogSelector} a`, rsvpText.calendarAccept).then(blockNewTab);
      cy.contains(`${dialogSelector} a`, rsvpText.calendarAccept).click();
      expectFreshConfirmation(guest);
    });
  });
});
