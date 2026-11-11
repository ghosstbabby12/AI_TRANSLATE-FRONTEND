import { useAuth } from "../auth/AuthProvider";
import { HistoryIcon, PlusIcon, TranslateIcon } from "../components/icons";
import { Logo } from "../components/Logo";
import { LoadingScreen, OfflineScreen } from "../components/StatusScreens";
import { AuthScreen } from "../features/auth/AuthScreen";
import { HistoryPage } from "../features/history/HistoryPage";
import { NewVideoPage } from "../features/home/NewVideoPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { VideoPage } from "../features/video/VideoPage";
import { navigate, paths, useRoute, type Route } from "../hooks/useRoute";
import { useT } from "../i18n";
import { UserMenu } from "./UserMenu";

export function App() {
  const { user, loading, connectionError, retryConnection, signOut } = useAuth();
  const route = useRoute();
  // With useT, App (and all its children) re-renders when the language changes
  const t = useT();

  if (loading) return <LoadingScreen />;
  if (!user && connectionError) return <OfflineScreen message={connectionError} onRetry={retryConnection} onSwitchAccount={signOut} />;
  if (!user) return <AuthScreen />;

  return (
    <>
      <header className="floating-header">
        <a href="#/" className="brand pill">
          <Logo />
          <span className="brand-text">{t("app.brand")}</span>
        </a>

        {/* Navigation dock: the active destination is raised in a bubble */}
        <nav className="dock" aria-label={t("nav.main")}>
          <a href="#/" className={route.view === "new" ? "is-active" : ""} data-tip={t("nav.translateVideo")}>
            <TranslateIcon />
            <span className="dock-label">{t("nav.translate")}</span>
          </a>
          <a href="#/historial" className={route.view === "history" ? "is-active" : ""} data-tip={t("nav.history")}>
            <HistoryIcon />
            <span className="dock-label">{t("nav.history")}</span>
          </a>
        </nav>

        <UserMenu user={user} onSignOut={signOut} />
      </header>

      <main>
        <CurrentPage route={route} />
      </main>

      {route.view !== "new" && (
        <button type="button" className="fab" onClick={() => navigate(paths.home)} aria-label={t("nav.newVideoAria")}>
          <PlusIcon />
          <span>{t("nav.newVideo")}</span>
        </button>
      )}
    </>
  );
}

function CurrentPage({ route }: { route: Route }) {
  switch (route.view) {
    case "new":
      return <NewVideoPage />;
    case "history":
      return <HistoryPage />;
    case "profile":
      return <ProfilePage />;
    case "video":
      // key: switching videos resets the whole page state
      return <VideoPage key={route.id} id={route.id} />;
  }
}
