import type { checkProtocolCtor } from './internal/constrains';
const isProtocolLegal: checkProtocolCtor<typeof WithLoading> = true; // eslint-disable-line
const branded = Symbol();

export abstract class WithLoading {
  $loading: boolean = false;

  [branded] = true;
  static isImplementedIn(x: any): x is WithLoading {
    return !!x && !!x[branded];
  }
}
