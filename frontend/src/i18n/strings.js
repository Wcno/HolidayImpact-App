// UI strings for the two supported languages. Values may contain {placeholders}
// filled in by t(key, params).
export const STRINGS = {
  es: {
    // nav / header
    nav_home: "Inicio",
    nav_holidays: "Feriados",
    nav_longweekends: "Fines largos",
    nav_compare: "Comparar",
    nav_dashboard: "Dashboard",
    lang_label: "Idioma",

    // controls
    field_country: "País",
    field_year: "Año",
    loading: "Cargando…",

    // home
    home_badge: "Datos abiertos de feriados",
    home_title_a: "Planifica tu año alrededor de los ",
    home_title_accent: "feriados",
    home_subtitle:
      "HolidayImpact reúne los días festivos de todo el mundo y los enriquece con métricas útiles: puentes, comparaciones entre países y estadísticas por año.",
    home_cta_primary: "Explorar feriados",
    home_cta_secondary: "Ver dashboard",
    home_open: "Abrir",
    feat_holidays_title: "Feriados por país",
    feat_holidays_desc: "Consulta los días festivos oficiales de más de 100 países para cualquier año.",
    feat_longweekends_title: "Fines de semana largos",
    feat_longweekends_desc: "Detecta automáticamente los puentes y planifica tus escapadas del año.",
    feat_compare_title: "Comparar países",
    feat_compare_desc: "Compara los feriados de hasta 5 países y descubre cuáles tienen en común.",
    feat_dashboard_title: "Dashboard",
    feat_dashboard_desc: "Métricas por país: distribución mensual y semanal, próximo feriado y más.",

    // holidays page
    holidays_title: "Feriados por país y año",
    holidays_count: "{n} feriados encontrados",
    table_date: "Fecha",
    table_holiday: "Feriado",
    table_empty: "No hay feriados para mostrar.",

    // long weekends page
    lw_title: "Fines de semana largos",
    lw_count: "{n} fines de semana largos detectados",
    lw_days: "{n} días libres consecutivos",
    lw_bridge_suggested: "Día puente sugerido: {date}",
    lw_holidays: "Feriado(s): {names}",
    badge_bridge: "Puente",
    badge_natural: "Natural",

    // compare page
    compare_title: "Comparar feriados entre países",
    compare_hint: "Selecciona entre 2 y 5 países.",
    compare_button: "Comparar",
    compare_summary: "Resumen",
    compare_country_count: "{code}: {n} feriados",
    compare_common: "Feriados en común ({n})",
    compare_th_names: "Nombres por país",

    // dashboard
    dash_title: "Dashboard de feriados",
    dash_total: "Total de feriados",
    dash_longweekends: "Fines de semana largos",
    dash_next: "días para {name} ({date})",
    dash_no_next: "Sin próximos feriados este año",
    dash_by_month: "Distribución por mes",
    dash_by_weekday: "Distribución por día de semana",
    dash_tooltip: "{label}: {n} feriados",
  },
  en: {
    nav_home: "Home",
    nav_holidays: "Holidays",
    nav_longweekends: "Long weekends",
    nav_compare: "Compare",
    nav_dashboard: "Dashboard",
    lang_label: "Language",

    field_country: "Country",
    field_year: "Year",
    loading: "Loading…",

    home_badge: "Open public holiday data",
    home_title_a: "Plan your year around ",
    home_title_accent: "public holidays",
    home_subtitle:
      "HolidayImpact gathers holidays from around the world and enriches them with useful metrics: long weekends, country comparisons and per-year statistics.",
    home_cta_primary: "Explore holidays",
    home_cta_secondary: "Open dashboard",
    home_open: "Open",
    feat_holidays_title: "Holidays by country",
    feat_holidays_desc: "Look up the official public holidays of 100+ countries for any year.",
    feat_longweekends_title: "Long weekends",
    feat_longweekends_desc: "Automatically detect long weekends and plan your getaways for the year.",
    feat_compare_title: "Compare countries",
    feat_compare_desc: "Compare the holidays of up to 5 countries and find which ones they share.",
    feat_dashboard_title: "Dashboard",
    feat_dashboard_desc: "Per-country metrics: monthly and weekday distribution, next holiday and more.",

    holidays_title: "Holidays by country and year",
    holidays_count: "{n} holidays found",
    table_date: "Date",
    table_holiday: "Holiday",
    table_empty: "No holidays to show.",

    lw_title: "Long weekends",
    lw_count: "{n} long weekends detected",
    lw_days: "{n} consecutive days off",
    lw_bridge_suggested: "Suggested bridge day: {date}",
    lw_holidays: "Holiday(s): {names}",
    badge_bridge: "Bridge",
    badge_natural: "Natural",

    compare_title: "Compare holidays between countries",
    compare_hint: "Select between 2 and 5 countries.",
    compare_button: "Compare",
    compare_summary: "Summary",
    compare_country_count: "{code}: {n} holidays",
    compare_common: "Shared holidays ({n})",
    compare_th_names: "Names by country",

    dash_title: "Holidays dashboard",
    dash_total: "Total holidays",
    dash_longweekends: "Long weekends",
    dash_next: "days until {name} ({date})",
    dash_no_next: "No upcoming holidays this year",
    dash_by_month: "Distribution by month",
    dash_by_weekday: "Distribution by weekday",
    dash_tooltip: "{label}: {n} holidays",
  },
};
