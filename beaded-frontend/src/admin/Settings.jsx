import { useState } from 'react';

import { studio } from './client.js';
import { Field, PageHead } from './parts.jsx';

const THEMES = [['brown', 'Earthy Brown'], ['pink', 'Blush Pink']];

export function Settings({ data, studioKey, update, flash }) {
  const { settings } = data;
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);

  const set = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));
  const setRate = (region) => (event) => setForm((current) => ({
    ...current,
    shippingRates: { ...current.shippingRates, [region]: event.target.value }
  }));

  const submit = async (event) => {
    event.preventDefault();
    const { topBannerText, featureOne, featureTwo, featureThree, theme, shippingRates, freeShippingOver } = form;
    const rates = Object.fromEntries(Object.entries(shippingRates).map(([region, rate]) => [region, Number(rate)]));
    const body = { topBannerText, featureOne, featureTwo, featureThree, theme, shippingRates: rates, freeShippingOver: Number(freeShippingOver) };

    setBusy(true);
    try {
      await studio('/admin/settings', { key: studioKey, method: 'PUT', body });
      update('settings', (current) => ({ ...current, ...body }));
      flash('The shop is updated.');
    } catch (err) {
      flash(err.message, 'error');
    }
    setBusy(false);
  };

  return (
    <>
      <PageHead title="Store settings" note={settings.showcase ? 'Showcase mode is on: checkout charges ₱1 and shows the portfolio notice.' : 'Checkout charges real prices.'} />

      <form className="studio-form" onSubmit={submit}>
        <Field label="Banner text" value={form.topBannerText} onChange={set('topBannerText')} required />

        <fieldset>
          <legend className="t-lead">Highlights</legend>
          <Field label="First highlight" value={form.featureOne} onChange={set('featureOne')} required />
          <Field label="Second highlight" value={form.featureTwo} onChange={set('featureTwo')} required />
          <Field label="Third highlight" value={form.featureThree} onChange={set('featureThree')} required />
        </fieldset>

        <fieldset>
          <legend className="t-lead">Shipping</legend>
          <div className="studio-form__two">
            {Object.entries(form.shippingRates || {}).map(([region, rate]) => (
              <Field key={region} label={`${region} rate in pesos`} type="number" min="0" step="any" value={rate} onChange={setRate(region)} required />
            ))}
          </div>
          <Field label="Free shipping over, in pesos" type="number" min="0" step="any" value={form.freeShippingOver} onChange={set('freeShippingOver')} required />
        </fieldset>

        <fieldset>
          <legend className="t-lead">Theme</legend>
          <div className="sizes">
            {THEMES.map(([value, label]) => (
              <button key={value} type="button" className="chip" aria-pressed={form.theme === value} onClick={() => setForm((current) => ({ ...current, theme: value }))}>{label}</button>
            ))}
          </div>
        </fieldset>

        <div className="studio-actions studio-actions--start">
          <button type="submit" className="btn" disabled={busy}>{busy ? 'Saving' : 'Update the shop'}</button>
        </div>
      </form>
    </>
  );
}
