// Pure validation for the demo enquiry form. No DOM access, so it can be unit-tested in Node
// and reused later by a server-side handler.

export const GATHERING_TYPES = {
  birthday: 'Birthday',
  christening: 'Christening',
  communion: 'First Holy Communion',
  family: 'Family gathering',
  networking: 'Networking meeting',
  community: 'Community meetup',
  other: 'Other',
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const trim = (v) => (typeof v === 'string' ? v.trim() : '');

/**
 * @param {Record<string, string|boolean>} raw  field values keyed by input name
 * @param {{ today?: string }} [opts]           today as YYYY-MM-DD (injected for testing)
 * @returns {{ valid: boolean, errors: Record<string,string>, values: Record<string, string|boolean|number> }}
 */
export function validateEnquiry(raw, opts = {}) {
  const today = opts.today || new Date().toISOString().slice(0, 10);
  const errors = {};
  const values = {
    type: trim(raw.type),
    dateUndecided: raw.dateUndecided === true || raw.dateUndecided === 'on',
    date: trim(raw.date),
    time: trim(raw.time),
    guests: trim(String(raw.guests ?? '')),
    frequency: trim(raw.frequency),
    recurrence: trim(raw.recurrence),
    food: trim(raw.food),
    name: trim(raw.name),
    email: trim(raw.email),
    phone: trim(raw.phone),
    notes: trim(raw.notes),
  };

  if (!Object.hasOwn(GATHERING_TYPES, values.type)) errors.type = 'Choose the type of gathering.';

  if (values.dateUndecided) {
    values.date = '';
  } else if (!values.date) {
    errors.date = 'Enter a preferred date, or tick “Date not decided”.';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || Number.isNaN(Date.parse(values.date))) {
    errors.date = 'Enter a valid date.';
  } else if (values.date < today) {
    errors.date = 'Preferred date must be today or later.';
  }

  if (!values.guests) errors.guests = 'Enter the approximate number of guests.';
  else if (!/^\d+$/.test(values.guests) || Number(values.guests) < 1) errors.guests = 'Guest count must be a whole number of 1 or more.';
  else values.guests = Number(values.guests);

  if (!['one-off', 'recurring'].includes(values.frequency)) errors.frequency = 'Choose one-off or recurring.';
  if (values.frequency !== 'recurring') values.recurrence = '';

  if (!values.name) errors.name = 'Enter your name.';
  if (!values.email) errors.email = 'Enter your email address.';
  else if (!EMAIL.test(values.email)) errors.email = 'Enter an email address in the format name@example.com.';

  return { valid: Object.keys(errors).length === 0, errors, values };
}

/**
 * Delivery boundary. In the demo nothing leaves the page: no fetch, no storage, no logging.
 * A future live implementation replaces this function (and needs server-side validation,
 * spam/rate controls, failure handling and an approved privacy notice first).
 */
export async function submitEnquiry(_values) {
  return { delivered: false, mode: 'preview' };
}
