export type NestedPartial<T> = {
  [P in keyof T]?: T[P] extends object ? NestedPartial<T[P]> : T[P];
};
