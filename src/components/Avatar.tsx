import { useState } from "react";
import type { User } from "../models/user";

/** Profile photo or, when there is none (or it fails to load), the name's initial. */
export function Avatar({ user, large = false }: { user: Pick<User, "name" | "photoUrl">; large?: boolean }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const initial = user.name.trim().charAt(0).toUpperCase() || "?";
  const className = `avatar ${large ? "avatar-large" : ""}`;
  if (user.photoUrl && failedUrl !== user.photoUrl) {
    return <img className={`${className} avatar-photo`} src={user.photoUrl} alt="" onError={() => setFailedUrl(user.photoUrl)} />;
  }
  return (
    <span className={className} aria-hidden>
      {initial}
    </span>
  );
}
