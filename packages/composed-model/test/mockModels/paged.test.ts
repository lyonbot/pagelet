import { protocols, ModelWithProtocol } from '@/index';

describe('mockModels/Paged', () => {
  class MyModel extends ModelWithProtocol(protocols.Paged, protocols.WithLoading) {
    get $total(){ return 100 }
  }

  it('works', () => {
    const model = new MyModel();


    expect(protocols.Paged.isImplementedIn(model)).toBe(true);
  });
});
