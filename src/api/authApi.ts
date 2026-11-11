import type { ProfileChanges, Session, User } from "../models/user";
import type { SessionDto, UserDto } from "./dto";
import { getJson, request, sendJson } from "./http";
import { toProfileChangesDto, toSession, toUser } from "./mappers";

/**
 * Anonymous id the app used before accounts existed. It is sent once when
 * signing in, so videos uploaded without an account move to the account.
 */
const ANONYMOUS_ID_KEY = "traductor.usuarioId";

function anonymousId(): string | undefined {
  try {
    return localStorage.getItem(ANONYMOUS_ID_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

function forgetAnonymousId() {
  try {
    localStorage.removeItem(ANONYMOUS_ID_KEY);
  } catch {
    /* no storage */
  }
}

async function startSession(path: string, body: Record<string, string>): Promise<Session> {
  const session = await sendJson<SessionDto>(path, "POST", { ...body, usuario_anonimo: anonymousId() });
  forgetAnonymousId();
  return toSession(session);
}

const asUser = async (promise: Promise<UserDto>) => toUser(await promise);

export const authApi = {
  login: (email: string, password: string) => startSession("/auth/login", { email, password }),
  register: (name: string, email: string, password: string) => startSession("/auth/registro", { nombre: name, email, password }),
  me: () => asUser(getJson<UserDto>("/auth/yo")),
};

export const profileApi = {
  get: (): Promise<User> => asUser(getJson<UserDto>("/perfil")),
  update: (changes: ProfileChanges) => asUser(sendJson<UserDto>("/perfil", "PATCH", toProfileChangesDto(changes))),
  /** Answers 204 (no body). */
  changePassword: async (current: string, next: string) => {
    await request("/perfil/contrasena", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actual: current, nueva: next }),
    });
  },
  uploadPhoto: (photo: File) => {
    const form = new FormData();
    form.append("foto", photo);
    return asUser(getJson<UserDto>("/perfil/foto", { method: "POST", body: form }));
  },
  removePhoto: () => asUser(getJson<UserDto>("/perfil/foto", { method: "DELETE" })),
};
