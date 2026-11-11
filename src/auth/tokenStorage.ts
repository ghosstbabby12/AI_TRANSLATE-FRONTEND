import { readStorage, writeStorage } from "../lib/browser";

const TOKEN_KEY = "traductor.token";

/** With "Remember me" the token goes to localStorage (persists); without it, to sessionStorage. */
export function readToken(): string | null {
  return readStorage(() => localStorage, TOKEN_KEY) ?? readStorage(() => sessionStorage, TOKEN_KEY);
}

export function saveToken(token: string | null, remember = true) {
  writeStorage(() => localStorage, TOKEN_KEY, null);
  writeStorage(() => sessionStorage, TOKEN_KEY, null);
  if (token) writeStorage(() => (remember ? localStorage : sessionStorage), TOKEN_KEY, token);
}
