import { useState } from "react";
import type { Usuario } from "../api";

/** Foto de perfil o, si no hay (o no carga), la inicial del nombre. */
export function Avatar({ usuario, grande = false }: { usuario: Pick<Usuario, "nombre" | "url_foto">; grande?: boolean }) {
  const [fallo, setFallo] = useState<string | null>(null);
  const inicial = usuario.nombre.trim().charAt(0).toUpperCase() || "?";
  const clase = `avatar ${grande ? "avatar-grande" : ""}`;
  if (usuario.url_foto && fallo !== usuario.url_foto) {
    return (
      <img className={`${clase} avatar-foto`} src={usuario.url_foto} alt="" onError={() => setFallo(usuario.url_foto)} />
    );
  }
  return (
    <span className={clase} aria-hidden>
      {inicial}
    </span>
  );
}
