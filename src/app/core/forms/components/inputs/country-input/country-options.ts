export interface CountryOption {
  code: string;
  label: string;
  value: string;
  englishName: string;
  flagUrl: string | null;
}

const COUNTRY_CODES =
  `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE YT ZA ZM ZW`.split(
    ' ',
  );
const spanishNames = new Intl.DisplayNames(['es'], { type: 'region' });
const englishNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const COUNTRY_OPTIONS: CountryOption[] = COUNTRY_CODES.map((code) => {
  const name = spanishNames.of(code) ?? code;
  return {
    code,
    value: name,
    label: name,
    flagUrl: `/flags/${code.toLowerCase()}.svg`,
    englishName: englishNames.of(code) ?? code,
  };
}).sort((left, right) => left.value.localeCompare(right.value, 'es'));

function normalize(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es');
}

export function countryOptionsFor(value: string | null | undefined): CountryOption[] {
  if (!value || COUNTRY_OPTIONS.some((option) => option.value === value)) return COUNTRY_OPTIONS;
  const selected = COUNTRY_OPTIONS.find((option) =>
    [option.code, option.value, option.englishName].some(
      (name) => normalize(name) === normalize(value),
    ),
  );
  if (selected)
    return COUNTRY_OPTIONS.map((option) =>
      option.code === selected.code ? { ...option, value } : option,
    );
  return [...COUNTRY_OPTIONS, { code: '', value, label: value, englishName: value, flagUrl: null }];
}
