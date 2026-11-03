import { useState } from 'react';

import { studio } from './client.js';
import { Field, PageHead } from './parts.jsx';

export function Categories({ data, studioKey, update, flash }) {
  const categories = data.settings?.categories || [];
  const [name, setName] = useState('');

  const save = async (next) => {
    try {
      await studio('/admin/settings', { key: studioKey, method: 'PUT', body: { categories: next } });
      update('settings', (settings) => ({ ...settings, categories: next }));
      return true;
    } catch (err) {
      flash(err.message, 'error');
      return false;
    }
  };

  const add = async (event) => {
    event.preventDefault();
    const fresh = name.trim();
    if (!fresh || categories.includes(fresh)) return;
    if (await save([...categories, fresh])) setName('');
  };

  return (
    <>
      <PageHead title="Categories" note="These appear as filters in the shop and as choices when adding a piece." />

      <form className="studio-inline" onSubmit={add}>
        <Field label="New category" value={name} onChange={(event) => setName(event.target.value)} required />
        <button type="submit" className="btn">Add category</button>
      </form>

      <ul className="rows studio-narrow">
        {categories.map((category) => (
          <li key={category} className="row row--pair">
            <span>{category}</span>
            <button type="button" className="link link--danger" aria-label={`Remove ${category}`} onClick={() => save(categories.filter((other) => other !== category))}>Remove</button>
          </li>
        ))}
      </ul>
    </>
  );
}
