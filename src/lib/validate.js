/**
 * Contact-detail checks shared by the quote form, the contact form and the
 * sending function (api/enquiry.js), so the browser and the server apply the
 * same rules. Pure functions: no DOM, no network.
 *
 *   checkName(raw)   -> { ok, value, error }
 *   checkEmail(raw)  -> { ok, value, error, suggestion }
 *   checkPhone(raw)  -> { ok, value, display, kind, error }
 *   checkContact({ name, email, phone }) -> { ok, errors, values, suggestion }
 *
 * `error` is a sentence for the visitor. An empty field returns
 * { ok: false, empty: true } with no error, so the caller decides whether the
 * field is required (checkContact requires all three).
 */

/* ---------- name ---------- */

const LINK_RE = /(https?:\/\/|www\.)/i;

export function checkName(raw) {
  const value = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (!value) return { ok: false, empty: true, value };
  if (value.length > 100) return { ok: false, value, error: 'That name is too long.' };
  if (LINK_RE.test(value)) return { ok: false, value, error: 'Please enter your name without web links.' };
  // At least two letters in any alphabet; rules out "1", "--" and "123".
  if ((value.match(/\p{L}/gu) || []).length < 2) return { ok: false, value, error: 'Please enter your name.' };
  return { ok: true, value };
}

/* ---------- email ---------- */

// The HTML spec's email pattern (what <input type="email"> checks), plus a
// top-level domain of at least two letters, which the spec does not require.
const EMAIL_RE = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}$/i;

/** Throwaway inboxes: a quote sent to one can never be answered. */
const DISPOSABLE = new Set([
  'mailinator.com', 'yopmail.com', 'guerrillamail.com', 'guerrillamail.net', 'sharklasers.com',
  '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org', 'tempmail.net',
  'throwawaymail.com', 'getnada.com', 'trashmail.com', 'dispostable.com', 'maildrop.cc',
  'mintemail.com', 'fakeinbox.com', 'mohmal.com', 'emailondeck.com', 'tempinbox.com',
  'mailnesia.com', 'spamgourmet.com', 'moakt.com', 'tempail.com', 'burnermail.io',
]);

/** Domains most buyers here use; a near miss of one is probably a typo. */
const COMMON = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'live.com',
  'ymail.com', 'aol.com', 'msn.com', 'googlemail.com', 'yahoo.co.uk', 'hotmail.co.uk',
  'proton.me', 'protonmail.com', 'zoho.com', 'mail.com', 'gmx.com',
];

/** Levenshtein distance, capped: returns max + 1 once it is clearly larger. */
function distance(a, b, max = 2) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** A likely intended domain for a mistyped one ("gmial.com" -> "gmail.com"), or ''. */
function suggestDomain(domain) {
  if (COMMON.includes(domain)) return '';
  let best = '';
  let bestD = 3;
  for (const c of COMMON) {
    const d = distance(domain, c, 2);
    if (d < bestD) { best = c; bestD = d; }
  }
  if (best) return best;
  // A known provider with a mistyped ending: "gmail.con", "yahoo.cm".
  const m = domain.match(/^([a-z0-9-]+)\.(con|cmo|comm|cm|om|co|c0m|vom|xom|ocm|cpm)$/);
  if (m && COMMON.includes(`${m[1]}.com`)) return `${m[1]}.com`;
  return '';
}

/** Providers people often type without their ending: "ada@gmail". */
const BARE = { gmail: 'gmail.com', yahoo: 'yahoo.com', hotmail: 'hotmail.com', outlook: 'outlook.com', icloud: 'icloud.com', ymail: 'ymail.com', live: 'live.com', googlemail: 'googlemail.com' };

/**
 * The address the visitor most likely meant, for the common slips: a comma or
 * semicolon for a dot ("gmail,com"), spaces, a stray dot at either end, a
 * provider with no ending ("ada@gmail"), or a mistyped provider. '' when
 * there is no confident fix.
 */
function repairEmail(raw) {
  let s = String(raw ?? '').trim().replace(/^mailto:/i, '').replace(/\s+/g, '');
  const at = s.lastIndexOf('@');
  if (at < 1) return '';
  const local = s.slice(0, at).replace(/^\.+|\.+$/g, '');
  let domain = s.slice(at + 1).toLowerCase().replace(/[,;:]/g, '.').replace(/\.{2,}/g, '.').replace(/^\.+|\.+$/g, '');
  if (BARE[domain]) domain = BARE[domain];
  domain = suggestDomain(domain) || domain;
  s = `${local}@${domain}`;
  return EMAIL_RE.test(s) && !local.includes('..') && s !== String(raw ?? '').trim() ? s : '';
}

export function checkEmail(raw) {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed) return { ok: false, empty: true, value: '' };
  const at = trimmed.lastIndexOf('@');
  const value = at > 0 ? trimmed.slice(0, at) + '@' + trimmed.slice(at + 1).toLowerCase() : trimmed;
  // Every error carries the likely intended address when there is one, so the
  // form can offer it in one tap ("Did you mean ada@gmail.com?").
  const bad = (error) => ({ ok: false, value, error, fix: repairEmail(trimmed) });
  if (/\s/.test(value)) return bad('Email addresses cannot contain spaces.');
  if ((value.match(/@/g) || []).length !== 1) return bad('An email address has one @, like name@company.com.');
  const [local, domain] = value.split('@');
  if (!local || !domain) return bad('An email address looks like name@company.com.');
  if (value.length > 254 || local.length > 64) return bad('That email address is too long.');
  if (/[,;:]/.test(domain)) return bad(`Use a dot (.) in your email address, not a ${domain.includes(',') ? 'comma' : domain.includes(';') ? 'semicolon' : 'colon'}.`);
  if (local.startsWith('.') || local.endsWith('.') || local.includes('..') || domain.includes('..') || domain.endsWith('.')) {
    return bad('That email address has a misplaced dot.');
  }
  if (!domain.includes('.')) return bad('That email address is missing its ending, like .com or .ng.');
  if (!EMAIL_RE.test(value)) return bad('That email address looks incomplete. It should look like name@company.com.');
  if (DISPOSABLE.has(domain)) return { ok: false, value, error: 'Please use an email address you check regularly, not a temporary one.' };
  const fix = suggestDomain(domain);
  return { ok: true, value, suggestion: fix ? `${local}@${fix}` : '' };
}

/* ---------- phone ----------
   Nigerian numbers first, since nearly every buyer is in Nigeria:
     mobile    0 + 70x/80x/81x/90x/91x + 7 more digits  (11 digits: 0803 123 4567)
     landline  0 + area code + number                  (9 or 10 digits: 01 234 5678)
   either one also written with +234 / 234 instead of the leading 0. Any other
   country needs + and its country code, 8 to 15 digits in all (the E.164 limit).
   Values are returned in E.164 (+2348031234567) so sales can dial or WhatsApp
   them as written. */

const NG_MOBILE = /^[789][01]\d{8}$/; // after the leading 0 or +234
const NG_LANDLINE = /^[1-9]\d{7,8}$/;

/* There is deliberately no "sample number" check (0801 234 5678, 0811 111
   1111): it turned away numbers a real buyer can have, including Nigeria's
   repeated-digit vanity numbers. Format is checked; spam is handled by the
   trap field, the bot check and the rate limits (api/enquiry.js). */

const groupNg = (n) => (NG_MOBILE.test(n) ? `${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}` : `${n.slice(0, 1)} ${n.slice(1, 4)} ${n.slice(4)}`);

function nigerian(national) {
  const n = national.replace(/^0/, '');
  if (NG_MOBILE.test(n)) return { kind: 'ng-mobile', n };
  if (NG_LANDLINE.test(n) && !/^[789][01]/.test(n)) return { kind: 'ng-landline', n };
  return null;
}

export function checkPhone(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return { ok: false, empty: true, value: '' };
  const bad = (error) => ({ ok: false, value, error });
  if (/[a-z]/i.test(value)) return bad('Phone numbers can only contain digits, like 0803 123 4567.');
  if (!/^\+?[\d\s().-]+$/.test(value)) return bad('Use digits only, like 0803 123 4567 or +234 803 123 4567.');

  let digits = value.replace(/\D/g, '');
  let intl = value.startsWith('+');
  if (!intl && digits.startsWith('00')) { intl = true; digits = digits.slice(2); }

  let ng = null;
  if (intl || (digits.startsWith('234') && digits.length >= 12)) {
    if (digits.startsWith('234')) {
      const rest = digits.slice(3).replace(/^0/, '');
      ng = nigerian(rest);
      if (!ng) {
        return bad(rest.length > 10
          ? 'That number is too long. After +234 a Nigerian number has 10 digits, like +234 803 123 4567.'
          : 'That Nigerian number looks incomplete. After +234 it should have 10 digits, like +234 803 123 4567.');
      }
    } else {
      if (digits.length > 15) return bad('That number is too long. International numbers have at most 15 digits.');
      if (digits.length < 8) return bad('That number looks incomplete. Include the country code, like +44 20 7946 0000.');
      return { ok: true, value: `+${digits}`, display: `+${digits}`, kind: 'intl' };
    }
  } else if (digits.startsWith('0')) {
    ng = nigerian(digits);
    if (!ng) {
      if (digits.length > 11) return bad('That number is too long. Nigerian mobile numbers have 11 digits, like 0803 123 4567.');
      return bad(/^0[789][01]/.test(digits)
        ? 'That number is too short. Nigerian mobile numbers have 11 digits, like 0803 123 4567.'
        : 'That number does not look right. Nigerian mobile numbers have 11 digits, like 0803 123 4567.');
    }
  } else if (NG_MOBILE.test(digits)) {
    ng = { kind: 'ng-mobile', n: digits }; // 803 123 4567, typed without the 0
  } else {
    return bad('Start with 0 (like 0803 123 4567) or with + and your country code.');
  }

  return { ok: true, value: `+234${ng.n}`, display: `+234 ${groupNg(ng.n)}`, kind: ng.kind };
}

/* ---------- message ---------- */

const LINKS_RE = /(https?:\/\/|www\.|\[url|<a\s)/gi;
export const MESSAGE_MAX = 5000;

/** A message or notes field: optional unless `required`; at most 2 web links (spam is mostly links). */
export function checkMessage(raw, { required = false } = {}) {
  const value = String(raw ?? '').trim();
  if (!value) return required ? { ok: false, value, error: 'Please add a short message.' } : { ok: true, value };
  if (value.length > MESSAGE_MAX) return { ok: false, value, error: `Please keep this under ${MESSAGE_MAX.toLocaleString('en')} characters.` };
  if ((value.match(LINKS_RE) || []).length > 2) return { ok: false, value, error: 'Please remove the web links from your message, or call us.' };
  return { ok: true, value };
}

/* ---------- together ---------- */

/**
 * The quote and contact forms' rules: a name, an email and a phone, each
 * valid. Both contact details are required (client's request, 30 Oct 2026):
 * sales emails the quote and follows up by phone or WhatsApp.
 */
export function checkContact({ name, email, phone }) {
  const n = checkName(name);
  const e = checkEmail(email);
  const p = checkPhone(phone);
  const errors = {};
  if (n.empty) errors.name = 'Please enter your name.';
  else if (!n.ok) errors.name = n.error;
  if (e.empty) errors.email = 'Please enter your work email.';
  else if (!e.ok) errors.email = e.error;
  if (p.empty) errors.phone = 'Please enter your phone or WhatsApp number.';
  else if (!p.ok) errors.phone = p.error;
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    // The likely intended address: a typo fix for a valid one, a repair for a broken one.
    suggestion: e.ok ? e.suggestion : (e.fix || ''),
    values: { name: n.value, email: e.ok ? e.value : '', phone: p.ok ? p.value : '', phoneKind: p.ok ? p.kind : '' },
  };
}
