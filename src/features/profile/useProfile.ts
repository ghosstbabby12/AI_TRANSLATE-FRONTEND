import { useRef, useState, type FormEvent } from "react";
import { profileApi } from "../../api/authApi";
import { useAuth } from "../../auth/AuthProvider";
import { currentLanguage, translate, useLanguage } from "../../i18n";
import { errorText } from "../../lib/format";
import type { InterfaceLanguage, ProfileChanges, User } from "../../models/user";
import type { Notice } from "./ProfileFields";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MIN_PASSWORD = 8;

/** Upload, change or remove the profile photo. */
export function usePhoto() {
  const { updateUser } = useAuth();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function run(action: () => Promise<User>) {
    setNotice(null);
    setBusy(true);
    try {
      updateUser(await action());
    } catch (e) {
      setNotice({ kind: "error", text: errorText(e) });
    } finally {
      setBusy(false);
    }
  }

  function choose(file: File | undefined) {
    if (input.current) input.current.value = ""; // allows choosing the same file again
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) return setNotice({ kind: "error", text: translate("profile.photoTooLarge") });
    void run(() => profileApi.uploadPhoto(file));
  }

  return { input, busy, notice, pick: () => input.current?.click(), choose, remove: () => run(profileApi.removePhoto) };
}

/** Name, email, phone and interface language. Only the changed fields are sent. */
export function useProfileDetails(user: User) {
  const { updateUser } = useAuth();
  const { setLanguage } = useLanguage();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [language, setLanguageField] = useState<InterfaceLanguage>(user.interfaceLanguage ?? currentLanguage());
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const emailChanges = email.trim().toLowerCase() !== user.email;

  function changes(): ProfileChanges {
    const result: ProfileChanges = {};
    if (name.trim() !== user.name) result.name = name.trim();
    if (emailChanges) Object.assign(result, { email: email.trim(), currentPassword: password });
    if (phone.trim() !== (user.phone ?? "")) result.phone = phone.trim() || null;
    if (language !== user.interfaceLanguage) result.interfaceLanguage = language;
    return result;
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    const pending = changes();
    if (Object.keys(pending).length === 0) return setNotice({ kind: "ok", text: translate("profile.noChanges") });
    setNotice(null);
    setSaving(true);
    try {
      const updated = await profileApi.update(pending);
      updateUser(updated); // also applies the saved language
      setLanguage(updated.interfaceLanguage);
      setName(updated.name);
      setEmail(updated.email);
      setPhone(updated.phone ?? "");
      setPassword("");
      // Translated when shown, so it appears in the newly chosen language
      setNotice({ kind: "ok", text: "profile.saved" });
    } catch (err) {
      setNotice({ kind: "error", text: errorText(err) });
    } finally {
      setSaving(false);
    }
  }

  const visibleNotice: Notice = notice?.text === "profile.saved" ? { kind: "ok", text: translate("profile.saved") } : notice;
  const fields = { name, email, phone, language, password };
  const set = { name: setName, email: setEmail, phone: setPhone, language: setLanguageField, password: setPassword };
  return { fields, set, emailChanges, saving, notice: visibleNotice, save };
}

/** Password change: current + new + confirmation. */
export function usePasswordChange() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (next.length < MIN_PASSWORD) return setNotice({ kind: "error", text: translate("profile.passwordTooShort") });
    if (next !== confirm) return setNotice({ kind: "error", text: translate("profile.passwordsDontMatch") });
    setNotice(null);
    setSaving(true);
    try {
      await profileApi.changePassword(current, next);
      [setCurrent, setNext, setConfirm].forEach((reset) => reset(""));
      setNotice({ kind: "ok", text: translate("profile.passwordUpdated") });
    } catch (err) {
      setNotice({ kind: "error", text: errorText(err) });
    } finally {
      setSaving(false);
    }
  }

  return { fields: { current, next, confirm }, set: { current: setCurrent, next: setNext, confirm: setConfirm }, saving, notice, save };
}
