import { useEffect, useState } from "react";

// Hash routes (#/, #/historial, #/perfil, #/video/<id>): they work on any static
// hosting without rewrite rules. The paths are part of shared links: keep them.
export type Route = { view: "new" } | { view: "history" } | { view: "profile" } | { view: "video"; id: string };

function readRoute(): Route {
  const [first, second] = location.hash.replace(/^#\/?/, "").split("/");
  if (first === "historial") return { view: "history" };
  if (first === "perfil") return { view: "profile" };
  if (first === "video" && second) return { view: "video", id: second };
  return { view: "new" };
}

export const paths = {
  home: "/",
  history: "/historial",
  profile: "/perfil",
  video: (id: string) => `/video/${id}`,
};

export function navigate(path: string) {
  location.hash = path;
}

export function useRoute(): Route {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}
