import type { checkProtocolCtor } from './internal/constrains';
const isProtocolLegal: checkProtocolCtor<typeof Paged> = true; // eslint-disable-line
const branded = Symbol();

export abstract class Paged {
  $offset: number = 0;
  $total: number = 0;
  $pageSize: number = 20;

  /** current page number, since 1 */
  get $page() {
    return Math.floor(1 + this.$offset / this.$pageSize);
  }

  /** page count based on $total and $pageSize */
  get $pageCount() {
    return Math.ceil(this.$total / this.$pageSize);
  }

  [branded] = true;
  static isImplementedIn(x: any): x is Paged {
    return !!x && !!x[branded];
  }
}
