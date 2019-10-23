/// <reference path="../../node_modules/cypress/types/sinon/index.d.ts" />
/// <reference path="../../node_modules/cypress-plugin-tab/src/index.d.ts" />
/// <reference path="../../types/tui-pagination/index.d.ts" />
/// <reference path="../../types/tui-date-picker/index.d.ts" />
/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    (chainer: 'be.subset'): Chainable<Subject>;
    (chainer: 'be.foo'): Chainable<Subject>;

    getCell(rowKey: number | string, column: string): Chainable<any>;

    getCellData(): Chainable<any>;

    getByCls(...classNames: string[]): Chainable<any>;

    getByTestId(id: string): Chainable<any>;

    getCellByIdx(rowIdx: number, columnIdx: number): Chainable<any>;

    getCellContent(rowKey: number | string, column: string): Chainable<any>;

    createGrid(gridOptions: any, elementStyles?: any): Chainable<any>;

    createStyle(style: string): Chainable<any>;

    gridInstance(): Chainable<any>;

    stub(): Agent<sinon.SinonStub> & sinon.SinonStub;
  }
}

declare namespace Chai {
  interface Include {
    subset(subset: any): Assertion;
  }
}
