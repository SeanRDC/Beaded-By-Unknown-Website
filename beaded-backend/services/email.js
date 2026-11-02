const { Resend } = require('resend');

const FROM = 'Beaded by Unknown <support@beadedbyunknown.shop>';

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c]);

const peso = (amount) => `₱${Number(amount).toLocaleString('en-PH')}`;

let client;

/* The one point where mail leaves the system. */
const transport = {
  deliver: async (message) => {
    client ||= new Resend(process.env.RESEND_API_KEY);
    const result = await client.emails.send({ from: FROM, ...message });
    if (result && result.error) throw new Error('Email was rejected');
    return result;
  }
};

/* A mail failure must never fail the order or sign-in that triggered it. */
async function send(message) {
  try {
    await transport.deliver(message);
    return true;
  } catch (err) {
    console.error(`Email failed: ${err.name}`);
    return false;
  }
}

function frame(title, bodyHtml, box) {
  const highlight = box
    ? `<div style="background:#F0EFEB;border-radius:14px;padding:22px;text-align:center;margin:26px 0;">
         <span style="font-size:14px;color:#5A5347;">${escapeHtml(box.label)}</span><br/>
         <strong style="font-size:28px;letter-spacing:5px;color:#191612;display:block;margin-top:8px;">${escapeHtml(box.value)}</strong>
       </div>`
    : '';

  return `
    <div style="background:#FAFAF8;padding:36px 18px;font-family:'Century Gothic',Futura,Helvetica,Arial,sans-serif;color:#191612;">
      <div style="max-width:560px;margin:0 auto;">
        <p style="font-size:30px;line-height:1;letter-spacing:-1px;margin:0 0 6px;">beeeaded</p>
        <div style="height:2px;background:#B38E42;margin-bottom:30px;"></div>
        <h1 style="font-size:24px;font-weight:400;margin:0 0 14px;">${escapeHtml(title)}</h1>
        <div style="font-size:16px;line-height:1.55;">${bodyHtml}</div>
        ${highlight}
        <p style="font-size:16px;margin:28px 0 0;">Unknown</p>
        <p style="font-size:13px;color:#5A5347;margin:22px 0 0;">Beaded by Unknown. A gift for your friends, family, and yourself.</p>
      </div>
    </div>`;
}

const codeMessage = (subject, title, text, label, code) => ({
  subject,
  html: frame(title, `<p>${text}</p>`, { label, value: code })
});

const welcomeCode = (code) => codeMessage(
  'Your verification code',
  'Welcome',
  "I'm glad you're here. Use this code to finish creating your account. It works for 10 minutes.",
  'Verification code',
  code
);

const loginCode = (code) => codeMessage(
  'Your sign-in code',
  'Your sign-in code',
  "Use this code to finish signing in. It works for 10 minutes. If this wasn't you, you can ignore this email.",
  'Sign-in code',
  code
);

const resetCode = (code) => codeMessage(
  'Your password reset code',
  'Reset your password',
  "Use this code to choose a new password. It works for 10 minutes. If this wasn't you, you can ignore this email.",
  'Reset code',
  code
);

const deleteCode = (code) => codeMessage(
  'Your account deletion code',
  'Delete your account',
  '<strong>This cannot be undone.</strong> You will lose your order history and wishlist. If you want to go ahead, use this code. It works for 10 minutes.',
  'Deletion code',
  code
);

const itemList = (items = []) => {
  const rows = items
    .map((item) => `<li style="padding:3px 0;">${escapeHtml(item.quantity)} × ${escapeHtml(item.name)} (${escapeHtml(item.color)})</li>`)
    .join('');
  return `<ul style="background:#F0EFEB;border-radius:14px;padding:16px 16px 16px 34px;margin:18px 0;">${rows}</ul>`;
};

function receipt(order, { showcase }) {
  const body = showcase
    ? `<p>This shop is a portfolio project, so this order will not ship. Your test payment of ${peso(order.chargedAmount)} went through, and the ${peso(order.amountPaid)} total below is only for show.</p>`
    : `<p>I've received your payment of <strong>${peso(order.amountPaid)}</strong>. Each piece is made to order, so allow 7 to 14 days for me to make, check and pack it. I'll email you when it ships.</p>`;

  return {
    subject: 'Your receipt from Beaded by Unknown',
    html: frame(`Thank you, ${order.customerName}`, `${body}${itemList(order.items)}`)
  };
}

const STATUS_LINES = {
  Shipped: 'It is on its way with J&amp;T Express.',
  Delivered: 'It has arrived safely. I hope you love it.'
};

function orderStatus(order, status) {
  return {
    subject: `Your order has been ${status.toLowerCase()}`,
    html: frame(`Good news, ${order.customerName}`, `<p>${STATUS_LINES[status] || ''}</p>${itemList(order.items)}`, { label: 'Order status', value: status })
  };
}

function designStatus(design, status) {
  return {
    subject: `Your custom design has been ${status.toLowerCase()}`,
    html: frame('Good news', `<p>Your custom piece, ${escapeHtml(design.name)}, has been ${status.toLowerCase()}. ${STATUS_LINES[status] || ''}</p>`, { label: 'Design status', value: status })
  };
}

module.exports = {
  deleteCode,
  designStatus,
  escapeHtml,
  loginCode,
  orderStatus,
  receipt,
  resetCode,
  send,
  transport,
  welcomeCode
};
