import { useLang } from "../i18n/LanguageContext";

export default function LoadingSpinner() {
  const { t } = useLang();
  return <p className="muted">{t("loading")}</p>;
}
