import { Buffer } from 'node:buffer';

import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const API = 'http://localhost:4599';
const KEY = 'dev-admin-secret';
const ADMIN = { admin_secret: KEY };
const PICTURE = {
  name: 'piece.png',
  mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
};
const VIEWS = ['Overview', 'Orders', 'Custom designs', 'Catalogue', 'Add a piece', 'Categories', 'Journal', 'Reviews', 'Store settings'];

const unique = (name) => `${name} ${Date.now()}${Math.floor(Math.random() * 1000)}`;
const title = (page, name) => page.getByRole('heading', { level: 1, name });

async function openStudio(page) {
  await page.goto('/admin');
  await page.getByLabel('Studio key').fill(KEY);
  await page.getByRole('button', { name: 'Open the studio' }).click();
  await expect(title(page, 'Overview')).toBeVisible();
}

/* The way around is a side thread on desktop and a menu on a phone. */
async function go(page, name) {
  const menu = page.getByRole('button', { name: 'Menu' });
  const onPhone = await menu.isVisible();
  if (onPhone) await menu.click();
  const way = onPhone ? page.getByRole('dialog', { name: 'Studio menu' }) : page.getByRole('navigation', { name: 'Studio' });
  await way.getByRole('button', { name: new RegExp(`^${name}`) }).click();
  await expect(title(page, name)).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}

async function paidOrder(request, customer, extra = {}) {
  const products = await (await request.get(`${API}/api/products`)).json();
  const item = products.find((product) => product.isAvailable !== false);
  const cart = [extra.customOrderId ? { name: 'Design', qty: 1, customOrderId: extra.customOrderId } : { _id: item._id, name: item.name, qty: 1, sz: 'M' }];
  const checkoutForm = {
    firstName: customer,
    lastName: 'Cruz',
    email: 'buyer@example.test',
    phone: '09171234567',
    street: '1 Rizal St',
    barangay: 'San Isidro',
    city: 'Makati',
    province: 'Metro Manila',
    postalCode: '1200'
  };
  const started = await (await request.post(`${API}/api/create-checkout-session`, { data: { cart, shippingRegion: 'Luzon', checkoutForm } })).json();
  const ref = new URL(started.checkout_url).searchParams.get('ref');
  await request.post(`${API}/api/orders/confirm`, { data: { ref } });
}

test('a wrong key stays at the door', async ({ page }) => {
  await page.goto('/admin');
  await page.getByLabel('Studio key').fill('not the key');
  await page.getByRole('button', { name: 'Open the studio' }).click();
  await expect(page.getByRole('alert')).toHaveText('That key is not right.');
  await expect(title(page, 'The studio')).toBeVisible();
});

test('the studio stays open through a reload and locks on request', async ({ page }) => {
  await openStudio(page);
  await page.reload();
  await expect(title(page, 'Overview')).toBeVisible();
  await page.getByRole('button', { name: 'Lock' }).click();
  await expect(title(page, 'The studio')).toBeVisible();
  await page.reload();
  await expect(title(page, 'The studio')).toBeVisible();
});

test('a key that has been changed sends the studio back to the door', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('beaded_admin_key', 'an old key'));
  await page.goto('/admin');
  await expect(title(page, 'The studio')).toBeVisible();
});

test('a piece can be added, edited, sold out and deleted', async ({ page, request }) => {
  const name = unique('Studio Bracelet');
  await openStudio(page);

  await go(page, 'Add a piece');
  await page.getByLabel('Name').fill(name);
  await page.getByLabel('Price in pesos').fill('120');
  await page.getByLabel('Material').fill('Seed beads');
  await page.getByLabel('Description').fill('Strung for a test.');
  await page.getByLabel('Main picture').setInputFiles(PICTURE);
  await page.getByRole('button', { name: 'Add to the shop' }).click();
  await expect(title(page, 'Catalogue')).toBeVisible();

  const row = page.getByRole('listitem').filter({ hasText: name });
  await expect(row).toContainText('₱120');
  const saved = (await (await request.get(`${API}/api/products`)).json()).find((product) => product.name === name);
  expect(saved).toMatchObject({ price: 120, mat: 'Seed beads', desc: 'Strung for a test.' });

  await page.getByRole('button', { name: `Edit ${name}` }).click();
  await expect(page.getByLabel('Name')).toHaveValue(name);
  await page.getByLabel('Price in pesos').fill('0');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(row).toContainText('₱0');
  await page.getByRole('button', { name: `Edit ${name}` }).click();
  await expect(page.getByLabel('Price in pesos')).toHaveValue('0');
  await page.getByLabel('Price in pesos').fill('130');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(row).toContainText('₱130');

  await page.getByRole('button', { name: `${name}: Available` }).click();
  await expect(page.getByRole('button', { name: `${name}: Sold out` })).toBeVisible();
  await expect.poll(async () => (await (await request.get(`${API}/api/products`)).json()).find((product) => product.name === name).isAvailable).toBe(false);

  await page.getByRole('button', { name: `Delete ${name}` }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(row).toHaveCount(0);
});

test('deleting can be called off', async ({ page }) => {
  await openStudio(page);
  await go(page, 'Catalogue');
  await page.getByRole('button', { name: 'Delete November Necklace' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Keep it' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: 'November Necklace' })).toBeVisible();
});

test('categories can be added and removed', async ({ page, request }) => {
  const name = unique('Anklet');
  await openStudio(page);
  await go(page, 'Categories');
  await page.getByLabel('New category').fill(name);
  await page.getByRole('button', { name: 'Add category' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: name })).toBeVisible();
  await expect.poll(async () => (await (await request.get(`${API}/api/settings`)).json()).categories).toContain(name);

  await page.getByRole('button', { name: `Remove ${name}` }).click();
  await expect(page.getByRole('listitem').filter({ hasText: name })).toHaveCount(0);
  await expect.poll(async () => (await (await request.get(`${API}/api/settings`)).json()).categories).not.toContain(name);
});

test('store settings reach the shop', async ({ page, request }) => {
  await openStudio(page);
  await go(page, 'Store settings');
  await expect(page.getByText('Showcase mode is on')).toBeVisible();

  await page.getByLabel('Luzon rate in pesos').fill('111');
  await page.getByLabel('Free shipping over, in pesos').fill('650');
  await page.getByRole('button', { name: 'Blush Pink' }).click();
  await page.getByRole('button', { name: 'Update the shop' }).click();
  await expect(page.getByRole('status')).toHaveText('The shop is updated.');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'pink');

  const settings = await (await request.get(`${API}/api/settings`)).json();
  expect(settings).toMatchObject({ theme: 'pink', freeShippingOver: 650 });
  expect(settings.shippingRates.Luzon).toBe(111);

  await request.put(`${API}/api/admin/settings`, {
    headers: ADMIN,
    data: { theme: 'brown', freeShippingOver: 500, shippingRates: { ...settings.shippingRates, Luzon: 100 } }
  });
});

test('an article can be published, edited and deleted', async ({ page, request }) => {
  const name = unique('Studio notes');
  await openStudio(page);
  await go(page, 'Journal');
  await page.getByLabel('Title').fill(name);
  await page.getByLabel('Cover picture address').fill('https://images.unsplash.com/photo-1762762938024-6d69c11d8c0a?w=800');
  await page.getByLabel('Short excerpt').fill('A short note.');
  await page.getByLabel('The full story').fill('The whole note.');
  await page.getByRole('button', { name: 'Publish the article' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: name })).toBeVisible();

  await page.getByRole('button', { name: `Edit ${name}` }).click();
  await page.getByLabel('Short excerpt').fill('An edited note.');
  await page.getByRole('button', { name: 'Update the article' }).click();
  await expect.poll(async () => (await (await request.get(`${API}/api/blogs`)).json()).find((post) => post.title === name)?.ex).toBe('An edited note.');

  await page.getByRole('button', { name: `Delete ${name}` }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: name })).toHaveCount(0);
});

test('a review can be published and deleted', async ({ page }) => {
  const name = unique('Maria');
  await openStudio(page);
  await go(page, 'Reviews');
  await page.getByLabel('Customer name').fill(name);
  await page.getByLabel('What they said').fill('Lovely work.');
  await page.getByLabel('Rating, 1 to 5').fill('4.5');
  await page.getByRole('button', { name: 'Publish the review' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: name })).toContainText('4.5 of 5');

  await page.getByRole('button', { name: `Delete the review from ${name}` }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: name })).toHaveCount(0);
});

test('an order can be read, shipped and delivered', async ({ page, request }) => {
  const customer = unique('Lucia');
  await paidOrder(request, customer);
  await openStudio(page);
  await go(page, 'Orders');

  const row = page.getByRole('listitem').filter({ hasText: customer });
  await row.getByRole('button', { name: `${customer} Cruz` }).click();
  const details = page.getByRole('dialog', { name: 'Order details' });
  await expect(details).toContainText('1 Rizal St');
  await expect(details).toContainText('Shipping');
  await expect(details).toContainText('Actually charged');
  await details.getByRole('button', { name: 'Close' }).click();
  await expect(details).toHaveCount(0);

  await row.getByRole('button', { name: 'Mark shipped' }).click();
  await expect(row).toContainText('Shipped');
  await row.getByRole('button', { name: 'Mark delivered' }).click();
  await expect(row).toContainText('Delivered');
  await expect(row.getByRole('button')).toHaveCount(1);
});

test('only a paid design reaches the studio queue', async ({ page, request }) => {
  const name = unique('My design');
  const unpaid = unique('Unpaid design');
  const body = { email: 'buyer@example.test', collectionId: 'ce8', beads: Array.from({ length: 20 }, () => ({ name: 'Blue' })), stringId: 's1', wristCm: 16.5 };
  await request.post(`${API}/api/custom-orders`, { data: { ...body, name: unpaid } });
  const design = await (await request.post(`${API}/api/custom-orders`, { data: { ...body, name } })).json();
  await paidOrder(request, unique('Rosa'), { customOrderId: design._id });

  await openStudio(page);
  await go(page, 'Custom designs');
  await expect(page.getByText(unpaid)).toHaveCount(0);

  const card = page.getByRole('listitem').filter({ hasText: name }).first();
  await card.getByRole('button', { name: 'Start crafting' }).click();
  await expect(card).toContainText('Crafting');
  await card.getByRole('button', { name: 'Mark shipped' }).click();
  await card.getByRole('button', { name: 'Mark delivered' }).click();
  await expect(card).toContainText('Delivered');
});

test('the overview counts paid orders', async ({ page, request }) => {
  await paidOrder(request, unique('Elena'));
  const { revenue } = await (await request.get(`${API}/api/admin/stats`, { headers: ADMIN })).json();
  await openStudio(page);
  await expect(page.getByText(`₱${revenue.toLocaleString('en-PH')}`).first()).toBeVisible();
  await expect(page.getByRole('img', { name: /Sales for the last seven days/ })).toBeVisible();
});

test('every studio view is accessible, fits the screen and logs no errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/admin');
  const gate = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(gate.violations).toEqual([]);

  await page.getByLabel('Studio key').fill(KEY);
  await page.getByRole('button', { name: 'Open the studio' }).click();
  await expect(title(page, 'Overview')).toBeVisible();

  for (const view of VIEWS) {
    await go(page, view);
    await page.waitForTimeout(450);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(results.violations, view).toEqual([]);
    const width = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(width, view).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});
