import { useAuth } from "../../auth/AuthProvider";
import { useT } from "../../i18n";
import { DetailsCard, PasswordCard, PhotoCard } from "./ProfileCards";

export function ProfilePage() {
  const { user } = useAuth();
  const t = useT();
  return (
    <section className="profile-page">
      <header className="section-title">
        <h1>{t("profile.title")}</h1>
        <p className="muted">{t("profile.subtitle")}</p>
      </header>
      {user && (
        <div className="profile-grid">
          <PhotoCard user={user} />
          <div className="profile-column">
            <DetailsCard user={user} />
            <PasswordCard />
          </div>
        </div>
      )}
    </section>
  );
}
