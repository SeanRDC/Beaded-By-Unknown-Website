import { peso } from '../lib/money.js';

/* "₱85 to Metro Manila, ₱100 to Luzon and ₱130 to Mindanao", from the shop's own settings. */
export function shippingSentence({ shippingRates }) {
  const parts = Object.entries(shippingRates).map(([region, rate]) => `${peso(rate)} to ${region}`);
  if (parts.length < 2) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export function faqItems(settings) {
  const items = [
    {
      question: 'How long does my order take?',
      answer: 'Everything is made to order. Allow 7 to 14 days for me to make, check and pack your piece. Then it ships by J&T Express.'
    },
    {
      question: 'How much is shipping?',
      answer: `${shippingSentence(settings)}. Free on orders of ${peso(settings.freeShippingOver)} or more.`
    },
    {
      question: 'How do I find my size?',
      answer: 'Wrap a soft tape around your wrist, snug but not tight, and read it in centimetres. The builder counts the beads for you.'
    },
    {
      question: 'Can I design my own?',
      answer: 'Yes. In the builder you choose the beads, the colours, the string and one charm, and I string it to your wrist.'
    },
    {
      question: 'What are the beads made of?',
      answer: 'Seed and glass beads, acrylic, cracked, cat eye, mermaid acrylic, imitation jade and imitation pearl. They are not natural gemstones.'
    },
    {
      question: 'How do I care for my piece?',
      answer: 'Take it off before swimming, and store it in its pouch when you are not wearing it.'
    },
    {
      question: 'Can I cancel or return an order?',
      answer: 'Each piece is made for you, so all sales are final once I have started. Please check your wrist measurement before you order.'
    },
    {
      question: 'How can I pay?',
      answer: 'GCash, Maya, QR Ph or card, through PayMongo.'
    },
    {
      question: 'Can I follow my order?',
      answer: 'Your account shows its status, and I email you when it ships.'
    }
  ];

  if (settings.showcase) {
    items.push({
      question: 'Is this a real shop?',
      answer: 'This site is a portfolio project. Everything works, but nothing here is really for sale. Please do not place an order, because it will not arrive. Checkout runs in test mode at ₱1.'
    });
  }

  return items;
}
