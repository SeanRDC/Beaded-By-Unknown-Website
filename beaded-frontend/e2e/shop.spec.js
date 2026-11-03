import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const API = 'http://localhost:4599';
const ADMIN = { admin_secret: 'dev-admin-secret' };

const unique = (name) => `${name}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.test`;

/* Most tests start past the portfolio notice. */
test.beforeEach(async ({ page }, info) => {
  if (info.title.includes('notice')) return;
  await page.addInitScript(() => sessionStorage.setItem('beaded_notice_seen', '1'));
});

async function latestCode(request, address) {
  await expect.poll(async () => {
    const mail = await (await request.get(`${API}/__dev/mail`)).json();
    return mail.filter((message) => message.to === address).length;
  }).toBeGreaterThan(0);
  const mail = await (await request.get(`${API}/__dev/mail`)).json();
  const message = mail.filter((item) => item.to === address).pop();
  return message.html.match(/>\s*(\d{6})\s*</)[1];
}

const bag = (page) => page.getByRole('dialog', { name: 'Your bag' });

async function addToBag(page, slug = 'november-necklace') {
  await page.goto(`/shop/${slug}`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const add = page.getByRole('button', { name: /^Add to bag/ }).filter({ visible: true }).first();
  await add.click();
  await expect(bag(page)).toBeVisible();
}

async function goToCheckout(page) {
  await bag(page).getByRole('link', { name: 'Checkout' }).click();
  await expect(bag(page)).toBeHidden();
  await expect(page).toHaveURL(/\/checkout$/);
}

async function fillCheckout(page, email = unique('buyer')) {
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mobile number').fill('09171234567');
  await page.getByLabel('First name').fill('Ana');
  await page.getByLabel('Last name').fill('Cruz');
  await page.getByLabel('House or unit, building, street').fill('1 Rizal St');
  await page.getByLabel('Barangay').fill('San Isidro');
  await page.getByLabel('City').fill('Makati');
  await page.getByLabel('Province').fill('Metro Manila');
  await page.getByLabel('Postal code').fill('1200');
  await page.getByLabel('Region').selectOption('Luzon');
  await page.getByRole('button', { name: 'Continue to shipping' }).click();
  return email;
}

test('the portfolio notice shows once a session', async ({ page }) => {
  await page.goto('/');
  const notice = page.getByRole('dialog', { name: 'This shop is a portfolio project' });
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("won't arrive");
  await notice.getByRole('button', { name: 'I understand' }).click();
  await expect(notice).toBeHidden();
  await page.reload();
  await page.waitForTimeout(1300);
  await expect(notice).toBeHidden();
});

test('the portfolio notice also greets a visitor arriving on a product link', async ({ page }) => {
  await page.goto('/shop/november-necklace');
  await expect(page.getByRole('dialog', { name: 'This shop is a portfolio project' })).toBeVisible();
});

const scrollY = (page) => page.evaluate(() => window.scrollY);

async function scrollHomeToBracelet(page) {
  await page.goto('/');
  await page.locator('#fit').scrollIntoViewIfNeeded();
  await expect.poll(() => scrollY(page)).toBeGreaterThan(300);
  return scrollY(page);
}

test('home returns to the same place after a reload', async ({ page }) => {
  const before = await scrollHomeToBracelet(page);
  await page.reload();
  await expect.poll(() => scrollY(page)).toBeGreaterThan(before - 60);
});

test('the shop returns to the same place after a reload', async ({ page }) => {
  await page.goto('/shop');
  await page.locator('#site-foot').scrollIntoViewIfNeeded();
  await expect.poll(() => scrollY(page)).toBeGreaterThan(200);
  const before = await scrollY(page);
  await page.reload();
  await expect.poll(() => scrollY(page)).toBeGreaterThan(before - 60);
});

test('a new visit to home starts at the top', async ({ page }) => {
  await scrollHomeToBracelet(page);
  await page.goto('/');
  await expect(page.locator('#fit')).toBeAttached();
  expect(await scrollY(page)).toBe(0);
});

test('going back to a page that was never scrolled returns to its top', async ({ page }) => {
  await page.goto('/size-guide');
  /* A dispatched click, because a real one would scroll down to the footer link first. */
  await page.locator('footer a[href="/faq"]').dispatchEvent('click');
  await expect(page).toHaveURL(/\/faq$/);
  await page.locator('#site-foot').scrollIntoViewIfNeeded();
  await expect.poll(() => scrollY(page)).toBeGreaterThan(100);
  await page.goBack();
  await expect(page).toHaveURL(/\/size-guide$/);
  await expect.poll(() => scrollY(page)).toBe(0);
});

test('the back button returns to the same place on home', async ({ page }) => {
  const before = await scrollHomeToBracelet(page);
  await page.getByRole('link', { name: 'String this one' }).click();
  await expect(page).toHaveURL(/\/custom$/);
  await page.goBack();
  await expect(page.locator('#fit')).toBeVisible();
  await expect.poll(() => scrollY(page)).toBeGreaterThan(before - 60);
});

test('a short page keeps its footer on the first screen', async ({ page }) => {
  await page.goto('/nowhere');
  await expect(page.getByRole('heading', { name: 'This one slipped off the string' })).toBeVisible();
  const top = await page.locator('#site-foot').evaluate((footer) => footer.getBoundingClientRect().top);
  expect(top).toBeLessThan(page.viewportSize().height);
});

for (const [name, path] of [['the shop', '/shop'], ['a piece', '/shop/november-necklace']]) {
  test(`${name} opens without the layout jumping`, async ({ page }) => {
    await page.addInitScript(() => {
      window.layoutShift = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) window.layoutShift += entry.value;
        });
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => window.layoutShift)).toBeLessThan(0.1);
  });
}

test('home shows the name, pieces, questions and footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Beaded by Unknown/);
  await expect(page.getByRole('heading', { name: 'The pieces' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'November Necklace' }).first()).toBeVisible();
  await expect(page.getByText('How long does my order take?')).toBeAttached();
  await expect(page.getByRole('link', { name: 'Developed by Sean Rhani Dela Cruz' })).toBeAttached();
  await expect(page.getByText('Portfolio project. Orders are not fulfilled.')).toBeAttached();
});

test('the wrist control counts beads and prices them', async ({ page }) => {
  await page.goto('/');
  await page.locator('#wrist').evaluate((input) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '19');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const count = page.locator('.fit__count b');
  await expect(count).toHaveText('23');
  await expect(page.locator('.fit__total strong')).toHaveText('₱79');
  await page.getByRole('button', { name: 'Regular Seed 3 mm' }).click();
  await expect(count).toHaveText('63');
  await expect(page.locator('.fit__total strong')).toHaveText('₱64.50');
});

test('a product has its own URL that survives a refresh', async ({ page }) => {
  await page.goto('/shop');
  await page.getByRole('link', { name: 'November Necklace' }).first().click();
  await expect(page).toHaveURL(/\/shop\/november-necklace$/);
  await expect(page.getByRole('heading', { level: 1, name: 'November Necklace' })).toBeVisible();
  await expect(page).toHaveTitle(/November Necklace/);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'November Necklace' })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/shop$/);
});

test('shop categories filter the pieces and can be linked to', async ({ page }) => {
  await page.goto('/shop');
  await page.getByRole('button', { name: 'Necklace', exact: true }).click();
  await expect(page).toHaveURL(/category=Necklace/);
  await expect(page.getByRole('link', { name: 'November Necklace' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Basic Beads Bracelet' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Basic Beads Bracelet' })).toHaveCount(0);
});

test('a sold out piece cannot be added', async ({ page }) => {
  await page.goto('/shop/glossy-beads-bracelet');
  await expect(page.getByText('Sold out for now.')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Add to bag/ })).toHaveCount(0);
});

test('an old product link shows a way back', async ({ page }) => {
  await page.goto('/shop/not-a-real-piece');
  await expect(page.getByRole('heading', { name: 'That piece is no longer here' })).toBeVisible();
  await page.getByRole('link', { name: 'See the other pieces' }).click();
  await expect(page).toHaveURL(/\/shop$/);
});

test('an unknown address shows the designed 404', async ({ page }) => {
  await page.goto('/this/does/not/exist');
  await expect(page.getByRole('heading', { name: 'This one slipped off the string' })).toBeVisible();
});

test('removing one size leaves the other', async ({ page }, info) => {
  test.skip(info.project.name === 'phone', 'covered on desktop');
  await page.goto('/shop/november-necklace');
  await page.getByRole('button', { name: 'S', exact: true }).click();
  await page.getByRole('button', { name: /^Add to bag/ }).click();
  await expect(bag(page)).toBeVisible();
  await bag(page).getByRole('button', { name: 'Close' }).click();
  await expect(bag(page)).toBeHidden();
  await page.getByRole('button', { name: 'L', exact: true }).click();
  await page.getByRole('button', { name: /^Add to bag/ }).click();

  await expect(bag(page).getByText('Size S')).toBeVisible();
  await expect(bag(page).getByText('Size L')).toBeVisible();
  await bag(page).locator('.bag__line').filter({ hasText: 'Size S' }).getByRole('button', { name: 'Remove' }).click();
  await expect(bag(page).getByText('Size S')).toHaveCount(0);
  await expect(bag(page).getByText('Size L')).toBeVisible();
});

test('the bag survives a refresh', async ({ page }) => {
  await addToBag(page);
  await page.reload();
  await page.getByRole('button', { name: /^Bag/ }).first().click();
  await expect(bag(page).getByText('November Necklace')).toBeVisible();
});

test('the small name gains an e for each piece in the bag', async ({ page }) => {
  await addToBag(page);
  await expect(page.locator('.top .mini')).toHaveText('beeeeaded');
});

test('checkout charges the region rate, explains the test charge and confirms the order', async ({ page, request }) => {
  await addToBag(page);
  await goToCheckout(page);

  const email = await fillCheckout(page);
  await expect(page.locator('.summary')).toContainText('₱100');
  await expect(page.locator('.summary .sum__total')).toContainText('₱285');
  await page.getByRole('button', { name: 'Continue to payment' }).click();
  await expect(page.getByText("You'll be charged ₱1 through PayMongo and nothing will ship.")).toBeVisible();

  await page.getByRole('button', { name: 'Continue to PayMongo' }).click();
  await expect(page).toHaveURL(/\/checkout\/confirmed\?ref=/);
  await expect(page.getByRole('heading', { name: 'Thank you' })).toBeVisible();
  await expect(page.getByText('nothing will ship')).toBeVisible();

  await page.goto('/');
  await expect(page.locator('.top [data-bag-target]')).toContainText('0');

  const mail = await (await request.get(`${API}/__dev/mail`)).json();
  const receipts = mail.filter((message) => message.to === email);
  expect(receipts).toHaveLength(1);
  expect(receipts[0].html).toContain('will not ship');
});

test('free shipping applies at checkout over the threshold', async ({ page }) => {
  await page.goto('/shop/november-necklace');
  await page.getByRole('button', { name: 'One more' }).first().click();
  await page.getByRole('button', { name: 'One more' }).first().click();
  await expect(page.getByText('₱555').filter({ visible: true }).first()).toBeVisible();
  await page.getByRole('button', { name: /^Add to bag/ }).filter({ visible: true }).first().click();
  await expect(bag(page).getByText('Free shipping is on')).toBeVisible();
  await goToCheckout(page);
  await fillCheckout(page);
  await expect(page.locator('.summary')).toContainText('Free');
  await expect(page.locator('.summary .sum__total')).toContainText('₱555');
});

test('a cancelled payment returns to checkout with a message and a full bag', async ({ page }) => {
  await addToBag(page);
  await page.goto('/checkout?canceled=true');
  await expect(page.getByText('The payment was cancelled')).toBeVisible();
  await expect(page.locator('.summary')).toContainText('November Necklace');
});

test('the home bracelet carries into the builder and can be bought', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'String this one' }).click();
  await expect(page).toHaveURL(/\/custom$/);
  await expect(page.locator('.fit__count b')).toHaveText('20');
  await expect(page.getByText('For a 16.5 cm wrist you need about 20 beads.')).toBeVisible();

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: /Black Cat/ }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('That is a perfect fit')).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();

  await page.getByLabel(/Your email/).fill(unique('designer'));
  await page.getByLabel(/Name your bracelet/).fill('My bracelet');
  await page.getByRole('button', { name: 'Add to bag, ₱83' }).click();
  await expect(bag(page).getByText('My bracelet')).toBeVisible();

  await goToCheckout(page);
  await fillCheckout(page);
  await expect(page.locator('.summary .sum__total')).toContainText('₱183');
  await page.getByRole('button', { name: 'Continue to payment' }).click();
  await page.getByRole('button', { name: 'Continue to PayMongo' }).click();
  await expect(page.getByRole('heading', { name: 'Thank you' })).toBeVisible();
});

test('the builder needs at least five beads to continue', async ({ page }) => {
  await page.goto('/custom');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: /Add a Pink bead/ }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('String at least 5 beads to continue.')).toBeVisible();
});

test('a new customer can register, sign in with a code, save details and sign out', async ({ page, request }, info) => {
  const email = unique('new');
  await page.goto('/');
  if (info.project.name === 'phone') {
    await page.getByRole('button', { name: 'Menu' }).first().click();
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: 'Sign in' }).click();
  } else {
    await page.getByRole('button', { name: 'Sign in' }).first().click();
  }

  const dialog = page.getByRole('dialog', { name: /Sign in|Create your account/ });
  await dialog.getByRole('button', { name: 'Register' }).click();
  await page.getByLabel('First name').fill('Ana');
  await page.getByLabel('Last name').fill('Cruz');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/^Password/).fill('correct horse battery');
  await page.getByRole('button', { name: 'Create account' }).click();

  await page.getByLabel('6-digit code').fill(await latestCode(request, email));
  await page.getByRole('button', { name: 'Verify and sign in' }).click();
  await expect(page.getByText('Welcome, Ana')).toBeVisible();

  await page.goto('/account');
  await expect(page.getByRole('heading', { name: 'Hello, Ana' })).toBeVisible();
  await page.getByRole('button', { name: 'Details' }).click();
  await page.getByLabel('Mobile number').fill('09170000000');
  await page.getByRole('button', { name: 'Save details' }).click();
  await expect(page.getByText('Your details are saved.')).toBeVisible();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Hello, Ana' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL('/');
});

test('a forgotten password can be reset with an emailed code', async ({ page, request }, info) => {
  test.skip(info.project.name === 'phone', 'covered on desktop');
  const email = unique('forgetful');
  await request.post(`${API}/api/register`, { data: { firstName: 'Ana', lastName: 'Cruz', email, password: 'first password' } });
  await request.post(`${API}/api/verify-login-otp`, { data: { email, otp: await latestCode(request, email) } });

  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in' }).first().click();
  await page.getByRole('button', { name: 'Forgot your password?' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Send code' }).click();
  await expect(page.getByLabel('6-digit code')).toBeVisible();
  await expect.poll(async () => (await (await request.get(`${API}/__dev/mail`)).json()).filter((m) => m.to === email).length).toBe(2);
  await page.getByLabel('6-digit code').fill(await latestCode(request, email));
  await page.getByRole('button', { name: 'Verify code' }).click();
  await page.getByLabel(/New password/).fill('second password');
  await page.getByRole('button', { name: 'Change password' }).click();
  await expect(page.getByText('Password changed. Please sign in.')).toBeVisible();

  const res = await request.post(`${API}/api/login`, { data: { email, password: 'second password' } });
  expect(res.ok()).toBeTruthy();
});

test('search finds pieces by name and material', async ({ page }, info) => {
  await page.goto('/shop');
  if (info.project.name === 'phone') {
    await page.getByRole('button', { name: 'Menu' }).first().click();
    await page.getByRole('dialog', { name: 'Menu' }).getByRole('button', { name: 'Search' }).click();
  } else {
    await page.getByRole('button', { name: 'Search' }).first().click();
  }
  const dialog = page.getByRole('dialog', { name: 'Search' });
  await dialog.getByRole('searchbox').fill('seed');
  await expect(dialog.getByRole('link', { name: /Basic Beads Bracelet/ })).toBeVisible();
  await dialog.getByRole('searchbox').fill('zzz');
  await expect(dialog.getByText('Nothing matches')).toBeVisible();
});

test('saved pieces appear on the saved page', async ({ page }) => {
  await page.goto('/shop');
  await page.getByRole('button', { name: 'Save November Necklace' }).click();
  await page.goto('/wishlist');
  await expect(page.getByRole('link', { name: 'November Necklace' }).first()).toBeVisible();
});

test('the phone menu reaches the main pages', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'phone only');
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).first().click();
  await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Story' }).click();
  await expect(page).toHaveURL(/\/story$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('late-night hobby');
});

test('help pages read from the shop settings', async ({ page }) => {
  await page.goto('/shipping');
  await expect(page.getByRole('row', { name: /Mindanao/ })).toContainText('₱130');
  await expect(page.locator('main')).not.toContainText('₱150');
  await page.goto('/faq');
  await expect(page.getByText('Is this a real shop?')).toBeVisible();
  await page.goto('/terms');
  await expect(page.locator('main')).not.toContainText('gemstones');
});

test('Blush Pink set in the dashboard reaches customers', async ({ page, request }) => {
  await request.put(`${API}/api/admin/settings`, { headers: ADMIN, data: { theme: 'pink' } });
  try {
    await expect.poll(async () => (await (await request.get(`${API}/api/settings`)).json()).theme).toBe('pink');
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'pink');
  } finally {
    await request.put(`${API}/api/admin/settings`, { headers: ADMIN, data: { theme: 'brown' } });
  }
});

test.describe('with reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the page is complete with the thread fully drawn', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.word')).toBeVisible();
    await expect(page.getByRole('link', { name: 'November Necklace' }).first()).toBeVisible();
    const offset = await page.locator('.strand path').evaluate((path) => parseFloat(getComputedStyle(path).strokeDashoffset));
    expect(offset).toBeLessThan(1);
  });
});

test('nothing on the page overflows sideways', async ({ page }) => {
  for (const path of ['/', '/shop', '/shop/november-necklace', '/custom', '/story', '/faq', '/shipping', '/terms', '/journal']) {
    await page.goto(path);
    await page.waitForTimeout(300);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test('no page logs an error', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of ['/', '/shop', '/shop/november-necklace', '/custom', '/story', '/journal', '/journal/how-it-all-began', '/faq', '/size-guide', '/shipping', '/terms', '/wishlist', '/account']) {
    await page.goto(path);
    await page.waitForTimeout(250);
  }
  expect(errors).toEqual([]);
});

const PAGES = ['/', '/shop', '/shop/november-necklace', '/custom', '/story', '/journal', '/faq', '/size-guide', '/shipping', '/terms', '/wishlist', '/account'];

async function auditPages(page) {
  for (const path of PAGES) {
    await page.goto(path);
    await page.waitForTimeout(1200);
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const found = violations.map((item) => `${path}: ${item.id} (${item.nodes.length}) ${item.nodes[0].target}`);
    expect(found, path).toEqual([]);
  }
}

test.describe('accessibility', () => {
  test.use({ reducedMotion: 'reduce' });

  test('every page passes an automated WCAG AA audit', async ({ page }) => {
    test.setTimeout(120000);
    await auditPages(page);
  });

  test('every page passes in the Blush Pink theme too', async ({ page }) => {
    test.setTimeout(120000);
    await page.route('**/api/settings', async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, json: { ...(await response.json()), theme: 'pink' } });
    });
    await auditPages(page);
  });

  test('the bag and sign-in dialogs pass too', async ({ page }, info) => {
    test.skip(info.project.name === 'phone', 'covered on desktop');
    await addToBag(page);
    let { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(violations.map((item) => item.id)).toEqual([]);

    await page.goto('/');
    await page.getByRole('button', { name: 'Sign in' }).first().click();
    await expect(page.getByRole('dialog', { name: 'Sign in' })).toBeVisible();
    ({ violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze());
    expect(violations.map((item) => item.id)).toEqual([]);
  });
});

test('the keyboard skip link jumps past the header', async ({ page }, info) => {
  test.skip(info.project.name === 'phone', 'keyboard only');
  await page.goto('/shop');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test('Escape closes the notice and keeps it closed', async ({ page }) => {
  await page.goto('/');
  const notice = page.getByRole('dialog', { name: 'This shop is a portfolio project' });
  await expect(notice).toBeVisible();
  await expect(page.getByRole('button', { name: 'I understand' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(notice).toBeHidden();
});
