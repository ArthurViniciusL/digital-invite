describe('smoke', () => {
  it('renders the invite page', () => {
    cy.visit('/');
    cy.get('#root').should('not.be.empty');
  });
});
