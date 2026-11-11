import { useCallback, useRef, useState } from "react";
import { Avatar } from "../components/Avatar";
import { DotsIcon, SignOutIcon, UserIcon } from "../components/icons";
import { LanguagePicker, ThemePicker } from "../components/Pickers";
import { navigate, paths } from "../hooks/useRoute";
import { useDismiss } from "../hooks/useUiHelpers";
import { useT } from "../i18n";
import type { User } from "../models/user";

/** Floating button with the profile photo: opens the account, profile, theme, language and sign out. */
export function UserMenu({ user, onSignOut }: { user: User; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, root, close);
  const t = useT();

  return (
    <div className="user-menu" ref={root}>
      <button
        type="button"
        className={`floating-button more-button ${user.photoUrl ? "has-photo" : ""}`}
        aria-label={t("menu.account")}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        {user.photoUrl ? <Avatar user={user} /> : <DotsIcon />}
      </button>

      {open && (
        <div className="popover" role="menu">
          <div className="popover-account">
            <Avatar user={user} />
            <div>
              <strong>{user.name}</strong>
              <span className="muted">{user.email}</span>
            </div>
          </div>
          <button
            type="button"
            className="secondary full-width"
            role="menuitem"
            onClick={() => {
              close();
              navigate(paths.profile);
            }}
          >
            <UserIcon />
            {t("menu.myProfile")}
          </button>
          <div className="popover-section">
            <span className="popover-title">{t("menu.theme")}</span>
            <ThemePicker withLabels />
          </div>
          <div className="popover-section">
            <span className="popover-title">{t("menu.language")}</span>
            <LanguagePicker withLabels />
          </div>
          <button type="button" className="secondary full-width" role="menuitem" onClick={onSignOut}>
            <SignOutIcon />
            {t("menu.signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
