// Small shared render helpers. All content is escaped; data is never injected as HTML.
export const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Render a ContentField. Demo: pending → readable placeholder. Live: pending → nothing. */
export function renderField(field, mode = 'demo') {
  if (field.status === 'confirmed' && field.value !== null) return esc(field.value);
  if (mode === 'live') return '';
  return `<span class="pending">${esc(field.placeholder)}</span>`;
}

/** Tri-state facility. Unknown is never shown as "No". */
export function renderFacility(facility, mode = 'demo') {
  if (facility.available === true) return esc(facility.detail ? `Yes – ${facility.detail}` : 'Yes');
  if (facility.available === false) return esc(facility.detail ? `No – ${facility.detail}` : 'No');
  return mode === 'live' ? '' : '<span class="pending">To be confirmed</span>';
}

export const price = (n) => `£${n.toFixed(2)}`;
