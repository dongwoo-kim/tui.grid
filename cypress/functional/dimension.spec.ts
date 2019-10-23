before(() => {
  cy.visit('/dist');
});

beforeEach(() => {
  cy.document().then(doc => {
    doc.body.innerHTML = '';
  });
});

const columns = [
  { name: 'c1', editor: { type: 'text' } },
  { name: 'c2', editor: { type: 'text' } },
  { name: 'c3', editor: { type: 'text' } }
];

const data = [
  { c1: 'c1', c2: 'c2', c3: 'c3' },
  { c1: 'c1', c2: 'c2', c3: 'c3' },
  { c1: 'c1', c2: 'c2', c3: 'c3' },
  { c1: 'c1', c2: 'c2', c3: 'c3' }
];

it('rowHeight: 70', () => {
  cy.createGrid({ data, columns, rowHeight: 70 });
  cy.getByTestId('rside-body')
    .find('tr')
    .each($row => {
      expect($row.outerHeight()).to.eq(70);
    });
});

it('bodyHeight: 300', () => {
  cy.createGrid({ data, columns, bodyHeight: 300 });
  cy.getByTestId('rside-body')
    .invoke('outerHeight')
    .should('eq', 300);
});

it('bodyHeight: fitToParent, container-height: 300', () => {
  cy.createGrid({ data, columns, bodyHeight: 'fitToParent' }, { height: '300px' });
  cy.getByTestId('rside-header')
    .invoke('outerHeight')
    .then(headerHeight => {
      cy.getByTestId('rside-body')
        .invoke('outerHeight')
        .should('eq', 300 - headerHeight + 1);
    });
});

export {};
