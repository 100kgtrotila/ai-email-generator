/**
 * Auth domain types.
 * AuthUser is a serializable subset of Firebase's User object — safe to pass
 * as props across the Server/Client boundary (no functions, no Symbols).
 */

export interface AuthUser {
  readonly uid: string;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly photoURL: string | null;
}
