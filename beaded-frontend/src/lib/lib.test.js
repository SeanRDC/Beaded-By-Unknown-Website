import { describe, expect, test } from 'vitest';

import { COLLECTIONS } from '../data/beads.js';
import { addLine, cartCount, cartSubtotal, lineKey, removeLine, setLineQty } from './cart.js';
import { cld, cldSrcSet } from './cloudinary.js';
import { messageFor } from './fieldErrors.js';
import { designTotal, fit } from './fit.js';
import { peso } from './money.js';
import { shippingFor } from './shipping.js';
import { findBySlug, slugify } from './slug.js';

const collection = (id) => COLLECTIONS.find((c) => c.id === id);

describe('fit', () => {
  test('counts beads the way the builder does', () => {
    expect(fit(16.5, collection('ce8'))).toEqual({ count: 20, beads: 40, total: 73 });
  });

  test('handles half-peso beads', () => {
    expect(fit(19, collection('rs3'))).toEqual({ count: 63, beads: 31.5, total: 64.5 });
  });

  test('never drops below five beads', () => {
    expect(fit(1, collection('ce12')).count).toBe(5);
  });

  test('a design total includes string, extender and charm', () => {
    const beads = Array.from({ length: 20 }, () => ({ name: 'Blue' }));
    expect(designTotal({ collection: collection('ce8'), beads, string: { id: 's1', price: 8 } })).toBe(73);
    expect(designTotal({ collection: collection('ce8'), beads, string: { id: 's2', price: 6 }, extender: true, charms: [{ price: 10 }] })).toBe(89);
  });

  test('an extender only counts on the lock string', () => {
    const beads = Array.from({ length: 20 }, () => ({ name: 'Blue' }));
    expect(designTotal({ collection: collection('ce8'), beads, string: { id: 's1', price: 8 }, extender: true })).toBe(73);
  });
});

describe('peso', () => {
  test.each([[73, '₱73'], [64.5, '₱64.50'], [1250, '₱1,250'], [0, '₱0']])('formats %s', (amount, text) => {
    expect(peso(amount)).toBe(text);
  });
});

describe('shipping', () => {
  const settings = { shippingRates: { Luzon: 100, Mindanao: 130 }, freeShippingOver: 500 };

  test('uses the region rate', () => {
    expect(shippingFor(200, 'Mindanao', settings)).toBe(130);
  });

  test('is free at exactly the threshold', () => {
    expect(shippingFor(500, 'Luzon', settings)).toBe(0);
  });

  test('is charged one peso under the threshold', () => {
    expect(shippingFor(499, 'Luzon', settings)).toBe(100);
  });

  test('falls back to zero for a region not in the table', () => {
    expect(shippingFor(100, 'Mars', settings)).toBe(0);
  });
});

describe('bag lines', () => {
  const product = { _id: 'p1', name: 'Necklace', price: 185 };

  test('a line is a product plus a size', () => {
    expect(lineKey({ _id: 'p1', sz: 'M' })).toBe('p1|M');
    expect(lineKey({ id: 7, sz: 'S' })).toBe('7|S');
  });

  test('adding the same product and size raises the quantity', () => {
    const one = addLine([], product, { size: 'M', qty: 1 });
    const two = addLine(one, product, { size: 'M', qty: 2 });
    expect(two).toHaveLength(1);
    expect(two[0].qty).toBe(3);
  });

  test('a different size is its own line', () => {
    const lines = addLine(addLine([], product, { size: 'M', qty: 1 }), product, { size: 'L', qty: 1 });
    expect(lines).toHaveLength(2);
  });

  test('removing one size leaves the others', () => {
    const lines = addLine(addLine([], product, { size: 'M', qty: 1 }), product, { size: 'L', qty: 1 });
    const left = removeLine(lines, lineKey(lines[0]));
    expect(left).toHaveLength(1);
    expect(left[0].sz).toBe('L');
  });

  test('changing the quantity of one size leaves the others', () => {
    const lines = addLine(addLine([], product, { size: 'M', qty: 1 }), product, { size: 'L', qty: 1 });
    const changed = setLineQty(lines, lineKey(lines[1]), 4);
    expect(changed.map((l) => l.qty)).toEqual([1, 4]);
  });

  test('a quantity never drops below one', () => {
    const lines = addLine([], product, { size: 'M', qty: 1 });
    expect(setLineQty(lines, lineKey(lines[0]), 0)[0].qty).toBe(1);
  });

  test('count and subtotal read across lines', () => {
    const lines = addLine(addLine([], product, { size: 'M', qty: 2 }), { _id: 'p2', price: 65 }, { size: 'S', qty: 1 });
    expect(cartCount(lines)).toBe(3);
    expect(cartSubtotal(lines)).toBe(435);
  });

  test('a custom line keeps its saved design', () => {
    const lines = addLine([], { id: 9, name: 'Mine', price: 73, customOrderId: 'abc' }, { size: 'M', qty: 1 });
    expect(lines[0].customOrderId).toBe('abc');
  });
});

describe('slugs', () => {
  test('turn names into URL words', () => {
    expect(slugify('November Necklace')).toBe('november-necklace');
    expect(slugify("Ana's  Beads & Things!")).toBe('anas-beads-and-things');
    expect(slugify('Ñandú Péarl')).toBe('nandu-pearl');
  });

  test('find an item by its slug', () => {
    const items = [{ name: 'Basic Beads Bracelet' }, { name: 'November Necklace' }];
    expect(findBySlug(items, 'november-necklace')).toBe(items[1]);
    expect(findBySlug(items, 'gone')).toBeUndefined();
  });

  test('can use another field', () => {
    expect(findBySlug([{ title: 'How it all began' }], 'how-it-all-began', 'title').title).toBe('How it all began');
  });
});

describe('cloudinary', () => {
  const url = 'https://res.cloudinary.com/demo/image/upload/v1/folder/a.jpg';

  test('asks for a modern format at the needed width', () => {
    expect(cld(url, 640)).toBe('https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640/v1/folder/a.jpg');
  });

  test('leaves other hosts alone', () => {
    expect(cld('https://images.unsplash.com/a.jpg', 640)).toBe('https://images.unsplash.com/a.jpg');
    expect(cld('', 640)).toBe('');
    expect(cld(undefined, 640)).toBe('');
  });

  test('builds a srcset', () => {
    expect(cldSrcSet(url, [320, 640])).toContain('w_320/v1/folder/a.jpg 320w');
    expect(cldSrcSet(url, [320, 640])).toContain('w_640/v1/folder/a.jpg 640w');
    expect(cldSrcSet('https://other.test/a.jpg', [320])).toBeUndefined();
  });
});

describe('field messages', () => {
  const field = (validity, props = {}) => ({ tagName: 'INPUT', type: 'text', validationMessage: 'browser text', ...props, validity });

  test('says what an empty field needs, by kind of field', () => {
    expect(messageFor(field({ valueMissing: true }))).toBe('Please fill this in.');
    expect(messageFor(field({ valueMissing: true }, { tagName: 'SELECT', type: 'select-one' }))).toBe('Please choose one.');
    expect(messageFor(field({ valueMissing: true }, { type: 'checkbox' }))).toBe('Please tick this to continue.');
  });

  test('explains a wrong email and a short password', () => {
    expect(messageFor(field({ typeMismatch: true }, { type: 'email' }))).toContain('name@example.com');
    expect(messageFor(field({ tooShort: true }, { minLength: 8 }))).toBe('Please use at least 8 characters.');
  });

  test('falls back to the browser text for anything else', () => {
    expect(messageFor(field({ customError: true }))).toBe('browser text');
  });
});
