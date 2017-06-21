import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// import { greetingService } from '../../src/services/greetingService';

chai.use(sinonChai);

describe('GreetingService', () => {
  const sessionAttributes = {};

  let callback;

  beforeEach(() => {
    callback = sinon.spy();
  });

  afterEach(() => {
    callback.reset();
  });

  it('should trigger LEX close when greetingService is being called', () => {
    // greetingService({ sessionAttributes }, callback);
    //
    // expect(callback).to.have.been.called;
  });
});
