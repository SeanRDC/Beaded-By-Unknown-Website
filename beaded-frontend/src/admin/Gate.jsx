import { useState } from 'react';

import { studio } from './client.js';
import { Field } from './parts.jsx';

/* The key is checked by the server before anything else loads. */
export function Gate({ onOpen }) {
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await studio('/admin/stats', { key: value });
      onOpen(value);
    } catch (err) {
      setMessage(err.status === 403 ? 'That key is not right.' : err.message);
      setValue('');
      setBusy(false);
    }
  };

  return (
    <main className="studio-gate">
      <form onSubmit={submit}>
        <p className="mini">beeeaded</p>
        <h1 className="t-head">The studio</h1>
        <p className="soft">Enter the studio key to continue.</p>
        <Field label="Studio key" type="password" value={value} onChange={(event) => setValue(event.target.value)} autoComplete="current-password" required autoFocus />
        <button type="submit" className="btn btn--wide" disabled={busy}>{busy ? 'One moment' : 'Open the studio'}</button>
        {message && <p className="studio-error" role="alert">{message}</p>}
      </form>
    </main>
  );
}
