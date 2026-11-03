/* Replaces the browser's grey "Please fill out this field" bubble with a note in the shop's own style.
   Forms keep using plain `required`, `type="email"` and `minLength`; this only changes how a problem is shown. */
const NOTE = 'field__error';
let count = 0;
let focusedThisSubmit = false;

export function messageFor(el) {
  const v = el.validity;
  if (v.valueMissing) {
    if (el.type === 'checkbox') return 'Please tick this to continue.';
    if (el.tagName === 'SELECT' || el.type === 'radio') return 'Please choose one.';
    if (el.type === 'file') return 'Please choose a file.';
    return 'Please fill this in.';
  }
  if (v.typeMismatch && el.type === 'email') return 'That email looks incomplete. Try name@example.com.';
  if (v.typeMismatch && el.type === 'url') return 'That link looks incomplete. Start it with https://.';
  if (v.tooShort) return `Please use at least ${el.minLength} characters.`;
  if (v.tooLong) return `Please keep it to ${el.maxLength} characters.`;
  if (v.rangeUnderflow) return `Please use ${el.min} or more.`;
  if (v.rangeOverflow) return `Please use ${el.max} or less.`;
  if (v.stepMismatch) return 'Please use a whole number.';
  if (v.badInput) return 'Please enter a number.';
  return el.validationMessage || 'Please check this.';
}

const holderOf = (el) => el.closest('.field') || el.parentElement;
const noteOf = (el) => holderOf(el)?.querySelector(`:scope > .${NOTE}`);

function show(el) {
  const holder = holderOf(el);
  if (!holder) return;
  let note = noteOf(el);
  if (!note) {
    note = document.createElement('span');
    note.className = NOTE;
    note.id = `field-error-${(count += 1)}`;
    /* Hidden from the label's name, but still read out through aria-describedby. */
    note.setAttribute('aria-hidden', 'true');
    holder.append(note);
  }
  note.textContent = messageFor(el);
  el.setAttribute('aria-invalid', 'true');
  const described = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
  if (!described.includes(note.id)) el.setAttribute('aria-describedby', [...described, note.id].join(' '));
}

function hide(el) {
  const note = noteOf(el);
  el.removeAttribute('aria-invalid');
  if (!note) return;
  const described = (el.getAttribute('aria-describedby') || '').split(' ').filter((id) => id && id !== note.id);
  if (described.length) el.setAttribute('aria-describedby', described.join(' '));
  else el.removeAttribute('aria-describedby');
  note.remove();
}

function onInvalid(event) {
  const el = event.target;
  event.preventDefault();
  show(el);
  /* Stopping the bubble also stops the browser moving focus, so take the visitor to the first problem. */
  if (!focusedThisSubmit) {
    focusedThisSubmit = true;
    el.focus();
    setTimeout(() => { focusedThisSubmit = false; });
  }
}

function onEdit(event) {
  const el = event.target;
  if (el.getAttribute?.('aria-invalid') !== 'true') return;
  if (el.validity.valid) hide(el);
  else show(el);
}

export function installFieldErrors(root = document) {
  root.addEventListener('invalid', onInvalid, true);
  root.addEventListener('input', onEdit, true);
  root.addEventListener('change', onEdit, true);
}
