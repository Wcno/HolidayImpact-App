import { useLang } from "../i18n/LanguageContext";

export default function LoadingSpinner() {
  const { t } = useLang();
  return (
    <div className="spinner-wrapper" role="status">
      <svg className="spinner" viewBox="0 0 24 24" width="28" height="28">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.2" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round" />
      </svg>
      <span className="muted">{t("loading")}</span>
    </div>
  );
}
