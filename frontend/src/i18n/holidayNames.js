// Spanish translations for holiday names. The API returns names in English
// (Nager.Date's `name` field); in Spanish mode we look them up here and fall
// back to the original English text when a name isn't in the table.
//
// Lookups are normalized (case-, apostrophe- and accent-insensitive) because the
// source data mixes straight/curly apostrophes ("Presidents' Day" vs "Presidents
// Day"), casing ("Benito Juárez's birthday") and accent encodings.

const HOLIDAY_ES = {
  // Comunes / cristianos
  "New Year's Day": "Año Nuevo",
  "New Year's Eve": "Nochevieja",
  Epiphany: "Día de Reyes",
  "Three Kings' Day": "Día de Reyes",
  Carnival: "Carnaval",
  "Carnival Monday": "Lunes de Carnaval",
  "Carnival Tuesday": "Martes de Carnaval",
  "Shrove Tuesday": "Martes de Carnaval",
  "Ash Wednesday": "Miércoles de Ceniza",
  "Palm Sunday": "Domingo de Ramos",
  "Maundy Thursday": "Jueves Santo",
  "Holy Thursday": "Jueves Santo",
  "Good Friday": "Viernes Santo",
  "Holy Saturday": "Sábado Santo",
  "Easter Sunday": "Domingo de Resurrección",
  "Easter Monday": "Lunes de Pascua",
  "Labour Day": "Día del Trabajo",
  "Labor Day": "Día del Trabajo",
  "May Day": "Día del Trabajo",
  "International Workers' Day": "Día del Trabajo",
  "Ascension Day": "Ascensión del Señor",
  "Feast of the Ascension": "Ascensión del Señor",
  Pentecost: "Pentecostés",
  "Whit Sunday": "Domingo de Pentecostés",
  "Whit Monday": "Lunes de Pentecostés",
  "Pentecost Monday": "Lunes de Pentecostés",
  "Corpus Christi": "Corpus Christi",
  "Assumption Day": "Asunción de la Virgen",
  "Assumption of Mary": "Asunción de la Virgen",
  "All Saints' Day": "Día de Todos los Santos",
  "All Souls' Day": "Día de los Difuntos",
  "Immaculate Conception": "Inmaculada Concepción",
  "Christmas Eve": "Nochebuena",
  "Christmas Day": "Navidad",
  "St. Stephen's Day": "San Esteban",
  "Boxing Day": "San Esteban",
  "Independence Day": "Día de la Independencia",
  "Constitution Day": "Día de la Constitución",
  "Mother's Day": "Día de la Madre",
  "Father's Day": "Día del Padre",
  "Flag Day": "Día de la Bandera",
  "Columbus Day": "Día de la Raza",
  "National Day": "Fiesta Nacional",
  "National Holiday": "Fiesta Nacional",

  // Panamá
  "Martyr's Day": "Día de los Mártires",
  "Martyrs' Day": "Día de los Mártires",
  "Separation Day": "Separación de Panamá de Colombia",
  "Colon Day": "Día de Colón",
  "Shout in Villa de los Santos": "Grito de La Villa de los Santos",

  // México
  "Benito Juárez's Birthday": "Natalicio de Benito Juárez",
  "Revolution Day": "Día de la Revolución",
  "Change of Federal Government": "Transmisión del Poder Ejecutivo Federal",

  // Colombia
  "Saint Joseph's Day": "Día de San José",
  "Ascension of Jesus": "Ascensión del Señor",
  "Sacred Heart": "Sagrado Corazón de Jesús",
  "Saint Peter and Saint Paul": "San Pedro y San Pablo",
  "Our Lady of Chiquinquirá Day": "Día de la Virgen de Chiquinquirá",
  "Declaration of Independence": "Día de la Independencia",
  "Battle of Boyacá": "Batalla de Boyacá",
  "Independence of Cartagena": "Independencia de Cartagena",

  // Estados Unidos
  "Martin Luther King, Jr. Day": "Día de Martin Luther King Jr.",
  "Lincoln's Birthday": "Natalicio de Lincoln",
  "Washington's Birthday": "Día de los Presidentes",
  "Presidents' Day": "Día de los Presidentes",
  "Memorial Day": "Día de los Caídos",
  "Truman Day": "Día de Truman",
  Juneteenth: "Juneteenth (Día de la Emancipación)",
  "Juneteenth National Independence Day": "Juneteenth (Día de la Emancipación)",
  "Indigenous Peoples' Day": "Día de los Pueblos Indígenas",
  "Veterans Day": "Día de los Veteranos",
  "Thanksgiving Day": "Día de Acción de Gracias",

  // Canadá
  "Louis Riel Day": "Día de Louis Riel",
  "Islander Day": "Día de los Isleños",
  "Heritage Day": "Día del Patrimonio",
  "Family Day": "Día de la Familia",
  "Saint Patrick's Day": "Día de San Patricio",
  "Saint George's Day": "Día de San Jorge",
  "National Patriots' Day": "Día Nacional de los Patriotas",
  "Victoria Day": "Día de Victoria",
  "National Aboriginal Day": "Día Nacional de los Pueblos Indígenas",
  "Discovery Day": "Día del Descubrimiento",
  "Canada Day": "Día de Canadá",
  "Orangemen's Day": "Día de los Orangistas",
  "Civic Holiday": "Feriado Cívico",
  "British Columbia Day": "Día de Columbia Británica",
  "New Brunswick Day": "Día de Nuevo Brunswick",
  "Natal Day": "Día de Natal",
  "Saskatchewan Day": "Día de Saskatchewan",
  "Gold Cup Parade Day": "Desfile de la Copa de Oro",
  "National Day for Truth and Reconciliation": "Día Nacional de la Verdad y la Reconciliación",
  Thanksgiving: "Día de Acción de Gracias",
  "Armistice Day": "Día del Armisticio",
  "Remembrance Day": "Día del Recuerdo",
  "Saint-Jean-Baptiste Day": "Día de San Juan Bautista",

  // España
  "Hispanic Day": "Fiesta Nacional de España",

  // Argentina
  "Truth and Justice Memorial Day": "Día de la Memoria por la Verdad y la Justicia",
  "Malvinas Day": "Día del Veterano y de los Caídos en la Guerra de Malvinas",
  "May Revolution": "Día de la Revolución de Mayo",
  "Death of General Manuel Belgrano": "Paso a la Inmortalidad del Gral. Manuel Belgrano",
  "Anniversary of the Death of General José de San Martín":
    "Paso a la Inmortalidad del Gral. José de San Martín",
  "Day of Respect for Cultural Diversity": "Día del Respeto a la Diversidad Cultural",
  "National Sovereignty Day": "Día de la Soberanía Nacional",
};

function normalize(s) {
  return (s || "")
    .normalize("NFC")
    .replace(/[’‘']/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const NORMALIZED = Object.fromEntries(
  Object.entries(HOLIDAY_ES).map(([k, v]) => [normalize(k), v])
);

// Returns the holiday name in the requested language. English mode returns the
// original name unchanged; Spanish mode returns the translation or the original
// if it isn't in the table.
export function translateHoliday(name, lang) {
  if (lang !== "es") return name;
  return NORMALIZED[normalize(name)] || name;
}
