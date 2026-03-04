export type RBoolean =
  | {
      ok: true;
      value?: any
    }
  | { ok: false; reason: string };
