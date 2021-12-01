/**
 * a Protocol abstract class must has these static stuff
 */
export interface ProtocolCtorConstrains {
  isImplementedIn: (x: any) => boolean;
}

export type checkProtocolCtor<T> = T extends (abstract new () => any) & ProtocolCtorConstrains ? true : never;
