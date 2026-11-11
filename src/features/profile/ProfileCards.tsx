import { Avatar } from "../../components/Avatar";
import { CameraIcon, GlobeIcon, MailIcon, PhoneIcon, ShieldIcon, TrashIcon, UserIcon } from "../../components/icons";
import { formatDate, useT } from "../../i18n";
import type { InterfaceLanguage, User } from "../../models/user";
import { Field, NoticeMessage, PasswordField } from "./ProfileFields";
import { usePasswordChange, usePhoto, useProfileDetails } from "./useProfile";

/** Photo, name and "member since". */
export function PhotoCard({ user }: { user: User }) {
  const photo = usePhoto();
  const t = useT();
  const changeLabel = user.photoUrl ? t("profile.changePhoto") : t("profile.uploadPhoto");

  return (
    <section className="card profile-card profile-identity">
      <div className="profile-photo">
        <Avatar user={user} large />
        <button type="button" className="profile-photo-button" aria-label={changeLabel} onClick={photo.pick} disabled={photo.busy}>
          {photo.busy ? <span className="spinner spinner-button" aria-hidden /> : <CameraIcon />}
        </button>
      </div>
      <h2>{user.name}</h2>
      <p className="muted">{user.email}</p>
      <p className="profile-member-since">{t("profile.memberSince", { date: formatDate(user.createdAt, { dateStyle: "long" }) })}</p>

      <input ref={photo.input} type="file" accept="image/jpeg,image/png,image/webp,image/*" hidden onChange={(e) => photo.choose(e.target.files?.[0])} />
      <div className="profile-photo-actions">
        <button type="button" className="primary" onClick={photo.pick} disabled={photo.busy}>
          <CameraIcon />
          {photo.busy ? t("profile.uploadingPhoto") : changeLabel}
        </button>
        {user.photoUrl && (
          <button type="button" className="secondary" onClick={photo.remove} disabled={photo.busy}>
            <TrashIcon />
            {t("profile.removePhoto")}
          </button>
        )}
      </div>
      <p className="muted profile-help">{t("profile.photoHelp")}</p>
      <NoticeMessage notice={photo.notice} />
    </section>
  );
}

export function DetailsCard({ user }: { user: User }) {
  const { fields, set, emailChanges, saving, notice, save } = useProfileDetails(user);
  const t = useT();
  return (
    <section className="card profile-card">
      <CardHeader icon={<UserIcon />} title={t("profile.details")} />
      <form className="profile-form" onSubmit={save}>
        <Field label={t("profile.name")} icon={<UserIcon />}>
          <input value={fields.name} onChange={(e) => set.name(e.target.value)} autoComplete="name" required maxLength={100} />
        </Field>
        <Field label={t("profile.email")} icon={<MailIcon />}>
          <input type="email" value={fields.email} onChange={(e) => set.email(e.target.value)} autoComplete="email" required maxLength={254} />
        </Field>
        {emailChanges && (
          <PasswordField label={t("profile.confirmPassword")} value={fields.password} onChange={set.password} autoComplete="current-password" />
        )}
        <Field
          label={
            <>
              {t("profile.phone")} <span className="optional-label">({t("profile.optional")})</span>
            </>
          }
          icon={<PhoneIcon />}
        >
          <input
            type="tel"
            value={fields.phone}
            onChange={(e) => set.phone(e.target.value)}
            autoComplete="tel"
            placeholder={t("profile.phoneExample")}
            maxLength={20}
            pattern="\+?[\d\s\-\(\)]{7,20}"
          />
        </Field>
        <Field label={t("profile.interfaceLanguage")} icon={<GlobeIcon />}>
          <select value={fields.language} onChange={(e) => set.language(e.target.value as InterfaceLanguage)}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </Field>
        <NoticeMessage notice={notice} />
        <SubmitRow busy={saving} label={t("profile.saveChanges")} />
      </form>
    </section>
  );
}

export function PasswordCard() {
  const { fields, set, saving, notice, save } = usePasswordChange();
  const t = useT();
  return (
    <section className="card profile-card">
      <CardHeader icon={<ShieldIcon />} title={t("profile.security")} />
      <form className="profile-form" onSubmit={save}>
        {/* Helps password managers link the account */}
        <input type="text" autoComplete="username" hidden readOnly value="" />
        <PasswordField label={t("profile.currentPassword")} value={fields.current} onChange={set.current} autoComplete="current-password" />
        <PasswordField label={t("profile.newPassword")} value={fields.next} onChange={set.next} autoComplete="new-password" minLength={8} />
        <PasswordField label={t("profile.repeatPassword")} value={fields.confirm} onChange={set.confirm} autoComplete="new-password" minLength={8} />
        <NoticeMessage notice={notice} />
        <SubmitRow busy={saving} label={t("profile.updatePassword")} />
      </form>
    </section>
  );
}

function CardHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <header className="profile-card-header">
      <span className="feature-icon" aria-hidden>
        {icon}
      </span>
      <h2>{title}</h2>
    </header>
  );
}

function SubmitRow({ busy, label }: { busy: boolean; label: string }) {
  const t = useT();
  return (
    <div className="profile-actions">
      <button type="submit" className="primary" disabled={busy}>
        {busy ? t("common.saving") : label}
      </button>
    </div>
  );
}
