import { useState } from 'react';

import { studio } from './client.js';
import { Empty, Field, PageHead } from './parts.jsx';

const BLANK = { title: '', ex: '', content: '', cat: 'Journal', time: '5 min', img: '' };

export function Journal({ data, studioKey, reload, flash, ask }) {
  const [form, setForm] = useState(BLANK);
  const [editing, setEditing] = useState(null);

  const set = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));
  const reset = () => {
    setForm(BLANK);
    setEditing(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      await studio(editing ? `/admin/blogs/${editing}` : '/admin/blogs', { key: studioKey, method: editing ? 'PUT' : 'POST', body: form });
      flash(editing ? 'Article updated.' : 'Article published.');
      reset();
      reload('blogs');
    } catch (err) {
      flash(err.message, 'error');
    }
  };

  const edit = (post) => {
    setEditing(post._id);
    setForm({ title: post.title, ex: post.ex, content: post.content, cat: post.cat, time: post.time, img: post.img });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = (post) => ask({
    title: `Delete "${post.title}"?`,
    message: 'This removes the article from the journal for good.',
    action: 'Delete',
    onYes: async () => {
      try {
        await studio(`/admin/blogs/${post._id}`, { key: studioKey, method: 'DELETE' });
        if (editing === post._id) reset();
        reload('blogs');
      } catch (err) {
        flash(err.message, 'error');
      }
    }
  });

  return (
    <>
      <PageHead title="Journal" />
      <div className="studio-split">
        <form className="studio-form" onSubmit={submit}>
          <h2 className="t-lead">{editing ? 'Edit the article' : 'Write an article'}</h2>
          <Field label="Title" value={form.title} onChange={set('title')} required />
          <Field label="Cover picture address" type="url" value={form.img} onChange={set('img')} required />
          <Field label="Short excerpt" as="textarea" rows="2" value={form.ex} onChange={set('ex')} required />
          <Field label="The full story" as="textarea" rows="9" value={form.content} onChange={set('content')} required />
          <div className="studio-form__two">
            <Field label="Category" value={form.cat} onChange={set('cat')} required />
            <Field label="Read time" value={form.time} onChange={set('time')} required />
          </div>
          <div className="studio-actions studio-actions--start">
            <button type="submit" className="btn">{editing ? 'Update the article' : 'Publish the article'}</button>
            {editing && <button type="button" className="link" onClick={reset}>Cancel</button>}
          </div>
        </form>

        <section aria-label="Published articles">
          <h2 className="t-lead">Published</h2>
          {data.blogs.length === 0 ? <Empty>No articles yet.</Empty> : (
            <ul className="rows">
              {data.blogs.map((post) => (
                <li key={post._id} className="row row--post">
                  <span className="pic studio-thumb"><img src={post.img} alt="" loading="lazy" /></span>
                  <div>
                    <p>{post.title}</p>
                    <p className="soft t-small">{post.date}, {post.cat}</p>
                  </div>
                  <div className="studio-links">
                    <button type="button" className="link" aria-label={`Edit ${post.title}`} onClick={() => edit(post)}>Edit</button>
                    <button type="button" className="link link--danger" aria-label={`Delete ${post.title}`} onClick={() => remove(post)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
