const { test } = require('node:test');
const assert = require('node:assert/strict');
require('./helpers');
const email = require('../services/email');

const order = {
  customerName: 'Ana <img src=x onerror=alert(1)>',
  customerEmail: 'ana@example.test',
  amountPaid: 470,
  chargedAmount: 1,
  items: [{ name: '<b>Bold</b> necklace', quantity: 2, color: 'M', amount: 18500 }]
};

test('escapeHtml neutralises markup and quotes', () => {
  assert.equal(email.escapeHtml(`<a href="x">'&`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;');
  assert.equal(email.escapeHtml(null), '');
});

test('receipts escape customer and item text', () => {
  const html = email.receipt(order, { showcase: false }).html;
  assert.ok(!html.includes('<img src=x'));
  assert.ok(!html.includes('<b>Bold</b>'));
  assert.ok(html.includes('&lt;b&gt;Bold&lt;/b&gt; necklace'));
});

test('a showcase receipt says nothing will ship', () => {
  const html = email.receipt(order, { showcase: true }).html;
  assert.match(html, /portfolio project/i);
  assert.match(html, /will not ship/i);
  assert.ok(html.includes('₱1'));
});

test('a live receipt has no showcase wording', () => {
  const html = email.receipt(order, { showcase: false }).html;
  assert.doesNotMatch(html, /portfolio project/i);
});

test('every message signs off as Unknown in the first person', () => {
  const messages = [
    email.loginCode('123456'),
    email.welcomeCode('123456'),
    email.resetCode('123456'),
    email.deleteCode('123456'),
    email.receipt(order, { showcase: false }),
    email.orderStatus(order, 'Shipped'),
    email.designStatus({ name: 'Mine' }, 'Shipped')
  ];
  for (const m of messages) {
    assert.match(m.html, /Unknown/);
    assert.doesNotMatch(m.html, /Studio Team|our studio|\bWe\b|\bwe\b/);
    assert.ok(m.subject);
  }
});

test('a login code email does not talk about registering', () => {
  assert.doesNotMatch(email.loginCode('123456').html, /registration/i);
});

test('send reports failure instead of throwing', async () => {
  const real = email.transport.deliver;
  const quiet = console.error;
  email.transport.deliver = async () => {
    throw new Error('down');
  };
  console.error = () => {};
  const ok = await email.send({ to: 'a@b.test', subject: 's', html: 'h' });
  email.transport.deliver = real;
  console.error = quiet;
  assert.equal(ok, false);
});
