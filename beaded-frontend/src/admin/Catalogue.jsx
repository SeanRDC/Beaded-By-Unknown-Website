import { useState } from 'react';

import { cld } from '../lib/cloudinary.js';
import { peso } from '../lib/money.js';
import { studio } from './client.js';
import { Empty, Field, PageHead } from './parts.jsx';

const THUMB_WIDTH = 120;

export function Catalogue({ data, studioKey, update, reload, flash, ask, onEdit, onAdd }) {
  const toggle = async (item) => {
    const isAvailable = item.isAvailable === false;
    update('products', (products) => products.map((other) => (other._id === item._id ? { ...other, isAvailable } : other)));
    try {
      await studio(`/products/${item._id}/status`, { key: studioKey, method: 'PUT', body: { isAvailable } });
    } catch (err) {
      flash(err.message, 'error');
      reload('products');
    }
  };

  const remove = (item) => ask({
    title: `Delete ${item.name}?`,
    message: 'This removes it from the shop for good.',
    action: 'Delete',
    onYes: async () => {
      try {
        await studio(`/admin/products/${item._id}`, { key: studioKey, method: 'DELETE' });
        reload('products');
        flash(`${item.name} deleted.`);
      } catch (err) {
        flash(err.message, 'error');
      }
    }
  });

  return (
    <>
      <PageHead title="Catalogue" note={`${data.products.length} ${data.products.length === 1 ? 'piece' : 'pieces'}`}>
        <button type="button" className="btn" onClick={onAdd}>Add a piece</button>
      </PageHead>

      {data.products.length === 0 ? <Empty>The catalogue is empty.</Empty> : (
        <ul className="rows">
          {data.products.map((item) => {
            const available = item.isAvailable !== false;
            return (
              <li key={item._id} className={`row row--piece ${available ? '' : 'is-out'}`}>
                <span className="pic studio-thumb"><img src={cld(item.img, THUMB_WIDTH)} alt="" loading="lazy" /></span>
                <p>{item.name}</p>
                <p className="nums">{peso(item.price)}</p>
                <p className="soft t-small">{item.cat}</p>
                <button type="button" className="chip" aria-label={`${item.name}: ${available ? 'Available' : 'Sold out'}`} onClick={() => toggle(item)}>
                  {available ? 'Available' : 'Sold out'}
                </button>
                <div className="studio-links">
                  <button type="button" className="link" aria-label={`Edit ${item.name}`} onClick={() => onEdit(item)}>Edit</button>
                  <button type="button" className="link link--danger" aria-label={`Delete ${item.name}`} onClick={() => remove(item)}>Delete</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

const BLANK = { name: '', price: '', cat: '', mat: '', tag: '', desc: '' };

const fromItem = (item) => (item
  ? { name: item.name || '', price: item.price ?? '', cat: item.cat || '', mat: item.mat || '', tag: item.tag || '', desc: item.desc || '' }
  : BLANK);

export function PieceForm({ data, studioKey, editing, reload, flash, onDone }) {
  const categories = data.settings?.categories || [];
  const [form, setForm] = useState(() => fromItem(editing));
  const [files, setFiles] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));
  const pick = (name) => (event) => setFiles((current) => ({ ...current, [name]: event.target.files[0] }));

  const submit = async (event) => {
    event.preventDefault();
    const body = new FormData();
    const category = form.cat || categories[0] || '';
    Object.entries({ ...form, cat: category }).forEach(([name, value]) => body.append(name, value));
    if (files.primaryImage) body.append('primaryImage', files.primaryImage);
    if (files.secondaryImage) body.append('secondaryImage', files.secondaryImage);

    setBusy(true);
    try {
      await studio(editing ? `/products/${editing._id}` : '/products', { key: studioKey, method: editing ? 'PUT' : 'POST', body });
      await reload('products');
      flash(editing ? 'Saved.' : `${form.name} is in the shop.`);
      onDone();
    } catch (err) {
      flash(err.message, 'error');
      setBusy(false);
    }
  };

  return (
    <>
      <PageHead title={editing ? `Edit ${editing.name}` : 'Add a piece'} />
      <form className="studio-form" onSubmit={submit}>
        <Field label="Name" value={form.name} onChange={set('name')} required />
        <div className="studio-form__two">
          <Field label="Price in pesos" type="number" min="0" step="any" value={form.price} onChange={set('price')} required />
          <Field label="Category" as="select" value={form.cat || categories[0] || ''} onChange={set('cat')}>
            {[...new Set([...categories, form.cat].filter(Boolean))].map((name) => <option key={name}>{name}</option>)}
          </Field>
        </div>
        <Field label="Material" value={form.mat} onChange={set('mat')} />
        <Field label="Tag, shown on the card" value={form.tag} onChange={set('tag')} />
        <Field label="Description" as="textarea" rows="4" value={form.desc} onChange={set('desc')} />
        <div className="studio-form__two">
          <Field label={editing ? 'Replace the main picture' : 'Main picture'} type="file" accept="image/jpeg,image/png,image/webp" onChange={pick('primaryImage')} required={!editing} />
          <Field label="Second picture, shown on hover" type="file" accept="image/jpeg,image/png,image/webp" onChange={pick('secondaryImage')} />
        </div>
        <div className="studio-actions studio-actions--start">
          <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving' : editing ? 'Save changes' : 'Add to the shop'}</button>
          {editing && <button type="button" className="link" onClick={onDone}>Cancel</button>}
        </div>
      </form>
    </>
  );
}
