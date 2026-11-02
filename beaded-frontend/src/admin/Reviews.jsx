import { useState } from 'react';

import { studio } from './client.js';
import { Empty, Field, PageHead } from './parts.jsx';

const BLANK = { author: '', text: '', rating: 5 };

export function Reviews({ data, studioKey, reload, flash, ask }) {
  const [form, setForm] = useState(BLANK);

  const set = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    try {
      await studio('/admin/reviews', { key: studioKey, method: 'POST', body: { ...form, rating: Number(form.rating) } });
      flash('Review published.');
      setForm(BLANK);
      reload('reviews');
    } catch (err) {
      flash(err.message, 'error');
    }
  };

  const remove = (review) => ask({
    title: `Delete the review from ${review.author}?`,
    message: 'This removes it from the home page for good.',
    action: 'Delete',
    onYes: async () => {
      try {
        await studio(`/admin/reviews/${review._id}`, { key: studioKey, method: 'DELETE' });
        reload('reviews');
      } catch (err) {
        flash(err.message, 'error');
      }
    }
  });

  return (
    <>
      <PageHead title="Reviews" note="These run on the home page." />
      <div className="studio-split">
        <form className="studio-form" onSubmit={submit}>
          <h2 className="t-lead">Add a review</h2>
          <Field label="Customer name" value={form.author} onChange={set('author')} required />
          <Field label="What they said" as="textarea" rows="4" value={form.text} onChange={set('text')} required />
          <Field label="Rating, 1 to 5" type="number" min="1" max="5" step="0.5" value={form.rating} onChange={set('rating')} required />
          <div className="studio-actions studio-actions--start">
            <button type="submit" className="btn">Publish the review</button>
          </div>
        </form>

        <section aria-label="Published reviews">
          <h2 className="t-lead">Published</h2>
          {data.reviews.length === 0 ? <Empty>No reviews yet.</Empty> : (
            <ul className="rows">
              {data.reviews.map((review) => (
                <li key={review._id} className="row row--pair">
                  <blockquote>
                    <p>{review.text}</p>
                    <footer className="soft t-small">{review.author}, <span className="nums">{review.rating}</span> of 5</footer>
                  </blockquote>
                  <button type="button" className="link link--danger" aria-label={`Delete the review from ${review.author}`} onClick={() => remove(review)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
