import { ProtocolCtorConstrains } from './protocols/internal/constrains';
import { UnionToIntersection } from './utils/types';

type AbstractConstructor<T, ARGS extends any[]> = abstract new (...args: ARGS) => T;
type ProtocolCtor = AbstractConstructor<any, []> & ProtocolCtorConstrains;

type ConstructorWithProtocols<T extends AbstractConstructor<any, any[]>, ARGS extends any[]> = AbstractConstructor<
  UnionToIntersection<InstanceType<T>>,
  ARGS
>;

const copyProperties = (from: any, to: any, blockList?: string[]) => {
  const descriptors = { ...Object.getOwnPropertyDescriptors(from) };
  if (blockList) {
    blockList.forEach((key) => {
      delete descriptors[key];
    });
  }

  Object.defineProperties(to, descriptors);
};

export const ModelWithProtocol = <T extends ProtocolCtor[]>(...protocols: T) => {
  const applyAllProtocolCtorTo = (container: any) => {
    for (let i = 0; i < protocols.length; i++) {
      const Ctor = protocols[i] as unknown as new () => any;
      const temp = new Ctor(); // thanks to ES6, we can't use Ctor.call(container)
      copyProperties(temp, container);
    }
  };

  const newCtor = function (this: any) {
    // call each protocol's constructor with no parameter
    applyAllProtocolCtorTo(this);
  } as unknown as ConstructorWithProtocols<T[number], []> & {
    extends<U extends new (...args: any[]) => any>(
      baseClass: U,
    ): ConstructorWithProtocols<T[number] | U, ConstructorParameters<U>>;
  };

  for (let i = 0; i < protocols.length; i++) {
    copyProperties(protocols[i], newCtor, ['length', 'name', 'prototype']);
    copyProperties(protocols[i].prototype, newCtor.prototype, ['constructor']);
  }

  newCtor.extends = (BaseClass: any) => {
    class NewCtor2 extends BaseClass {
      constructor(...args: any[]) {
        super(...args);
        applyAllProtocolCtorTo(this);
      }
    }
    copyProperties(newCtor, NewCtor2, ['length', 'name', 'prototype']);
    copyProperties(newCtor.prototype, NewCtor2.prototype, ['constructor']);
    return NewCtor2 as any;
  };
  return newCtor;
};
