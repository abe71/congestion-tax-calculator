import { expect } from 'chai';

describe('#sum()', function() {

  context('without arguments', function() {
    it('should return 0', function() {
      expect(sum()).to.equal(0)
    })
  });
});