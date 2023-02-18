import { expect } from 'chai';
import {isTollFreeDate} from '../congestionTaxCalculator';

describe('congestionTaxCalculator', function() {

  context('Tollfree days', function() {
    it('not tollfree day', function() {
      const date1 = new Date('December 17, 2013 03:24:00');
      expect(isTollFreeDate(date1)).to.equal(false)
    })
    it('tollfree day', function() {
      const date1 = new Date('Mars 28, 2013 13:24:00');
      expect(isTollFreeDate(date1)).to.equal(true)
    })
  });
});
