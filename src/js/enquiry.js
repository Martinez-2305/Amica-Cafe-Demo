// Demo enquiry form behaviour. Values live in memory only for the life of the page.
import { validateEnquiry, submitEnquiry, GATHERING_TYPES } from './enquiry-validate.js';

const form = document.getElementById('enquiry-form');
const review = document.getElementById('enquiry-review');
const summary = document.getElementById('enquiry-errors');
const button = form && form.querySelector('[data-preview-button]');

if (form && review && summary && button) {
  const el = (name) => form.elements[name];
  const order = ['type', 'date', 'guests', 'frequency', 'name', 'email'];
  const focusTarget = { frequency: 'frequency-one-off' };

  form.noValidate = true;

  const syncDate = () => {
    const undecided = el('dateUndecided').checked;
    el('date').disabled = undecided;
    if (undecided) el('date').value = '';
  };
  const syncRecurrence = () => {
    document.getElementById('recurrence-field').hidden = form.elements.frequency.value !== 'recurring';
  };
  el('dateUndecided').addEventListener('change', syncDate);
  form.querySelectorAll('input[name="frequency"]').forEach((r) => r.addEventListener('change', syncRecurrence));
  syncDate();
  syncRecurrence();

  const read = () => ({
    type: el('type').value,
    dateUndecided: el('dateUndecided').checked,
    date: el('date').value,
    time: el('time').value,
    guests: el('guests').value,
    frequency: form.elements.frequency.value,
    recurrence: el('recurrence').value,
    food: el('food').value,
    name: el('name').value,
    email: el('email').value,
    phone: el('phone').value,
    notes: el('notes').value,
  });

  function showErrors(errors) {
    for (const name of order) {
      const msg = document.getElementById(`${name}-error`);
      const inputs = name === 'frequency' ? form.querySelectorAll('input[name="frequency"]') : [el(name)];
      msg.textContent = errors[name] || '';
      inputs.forEach((input) => {
        if (errors[name]) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      });
    }
    const failed = order.filter((n) => errors[n]);
    summary.hidden = failed.length === 0;
    const list = summary.querySelector('ul');
    list.replaceChildren();
    for (const name of failed) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${focusTarget[name] || name}`;
      a.textContent = errors[name];
      li.append(a);
      list.append(li);
    }
    if (failed.length) summary.focus();
  }

  function formatDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function showReview(v) {
    const rows = [
      ['Gathering type', GATHERING_TYPES[v.type]],
      ['Preferred date', v.dateUndecided ? 'Date not decided' : formatDate(v.date)],
      ['Preferred time', v.time || 'Not given'],
      ['Approximate guests', String(v.guests)],
      ['How often', v.frequency === 'recurring' ? 'Recurring' : 'One-off'],
    ];
    if (v.frequency === 'recurring') rows.push(['Recurrence details', v.recurrence || 'Not given']);
    rows.push(
      ['Food and drink', v.food || 'Not given'],
      ['Name', v.name],
      ['Email', v.email],
      ['Phone', v.phone || 'Not given'],
      ['Additional notes', v.notes || 'Not given'],
    );
    const dl = review.querySelector('dl');
    dl.replaceChildren();
    for (const [label, value] of rows) {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = label;
      dd.textContent = value; // textContent only: user input is never parsed as HTML
      row.append(dt, dd);
      dl.append(row);
    }
    form.hidden = true;
    review.hidden = false;
    review.focus();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const result = validateEnquiry(read());
    showErrors(result.errors);
    if (!result.valid) return;
    const outcome = await submitEnquiry(result.values);
    if (outcome.delivered === false) showReview(result.values);
  });

  review.querySelector('[data-edit]').addEventListener('click', () => {
    review.hidden = true;
    form.hidden = false;
    el('type').focus();
  });

  // Enabled only once the handler above is attached, so the form can never submit natively.
  button.disabled = false;
}
