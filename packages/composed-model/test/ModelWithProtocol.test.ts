import { ModelWithProtocol } from '@/ModelWithProtocol';

describe('ModelWithProtocol', () => {
  abstract class Abs1 {
    abstract foo: any;
    isAbs1: boolean;

    // not test here
    static isImplementedIn() {
      return true;
    }

    constructor() {
      this.isAbs1 = true;
    }

    fnFromAbs1() {
      return this.foo;
    }

    get getterFromAbs1() {
      return this.foo;
    }

    set setterFromAbs1(value: any) {
      this.foo = value;
    }
  }

  abstract class Abs2 {
    abstract bar: any;
    isAbs2 = true;

    // not test here
    static isImplementedIn() {
      return true;
    }

    fnFromAbs2() {
      return this.bar;
    }
  }

  it('works with ts checking', () => {
    // @ts-expect-error -- throws because no foo, bar
    class Test1 extends ModelWithProtocol(Abs1, Abs2) {}

    // @ts-expect-error -- throws because no foo
    class Test2 extends ModelWithProtocol(Abs1, Abs2) {
      bar!: string;
    }

    // @ts-expect-error -- throws because no bar
    class Test3 extends ModelWithProtocol(Abs1, Abs2) {
      foo!: string;
    }
  });

  it('works in runtime', () => {
    class Test extends ModelWithProtocol(Abs1, Abs2) {
      foo: string = 'implementedFoo';
      bar: string = 'implementedBar';
      marker: string;

      constructor(marker: string) {
        super();
        this.marker = marker;
      }
    }

    const t = new Test('my marker');
    expect(t.marker).toBe('my marker');
    expect(t.isAbs1).toBe(true);
    expect(t.isAbs2).toBe(true);
    expect(t.fnFromAbs1()).toBe('implementedFoo');
    expect(t.fnFromAbs2()).toBe('implementedBar');

    expect(t.getterFromAbs1).toBe(t.foo);
    t.setterFromAbs1 = 'reassign!';
    expect(t.getterFromAbs1).toBe('reassign!');
  });

  it('extends', () => {
    class AnotherBase {
      marker: string;
      constructor(marker: string) {
        this.marker = marker;
      }

      fromBase() {
        return this.marker;
      }
    }

    class Test extends ModelWithProtocol(Abs1, Abs2).extends(AnotherBase) {
      foo: string = 'implementedFoo';
      bar: string = 'implementedBar';
    }

    const t = new Test('my marker');
    expect(t.marker).toBe('my marker');
    expect(t.fromBase()).toBe('my marker');
    expect(t).toBeInstanceOf(AnotherBase);

    expect(t.isAbs1).toBe(true);
    expect(t.isAbs2).toBe(true);
    expect(t.fnFromAbs1()).toBe('implementedFoo');
    expect(t.fnFromAbs2()).toBe('implementedBar');

    expect(t.getterFromAbs1).toBe(t.foo);
    t.setterFromAbs1 = 'reassign!';
    expect(t.getterFromAbs1).toBe('reassign!');
  });
});
