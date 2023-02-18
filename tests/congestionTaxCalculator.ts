import { expect } from 'chai';
import {isTollFreeDate, getTax} from '../congestionTaxCalculator';
import { Car } from '../car';
import { tollDay46, tollDayMaxFee } from './fixtures/getTax';
// severalDays, tollDay46, tollDayMaxFee

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

  context('Get tax 46', function() {
    it('one toll day', function() {
      const car = new Car();
      const dates: Date[] = tollDay46.map( isoDate => {
        return new Date(isoDate);
      });
      const tax = getTax(car, dates);
      expect(tax).to.equal(46);
    })

    it('one toll day max fee', function() {
      const car = new Car();
      const dates: Date[] = tollDay46.map( isoDate => {
        return new Date(isoDate);
      });
      const tax = getTax(car, dates);
      expect(tax).to.equal(60);
    })
  });

});
