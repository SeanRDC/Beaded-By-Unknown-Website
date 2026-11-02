/* The bead, string and charm catalogue. The server holds the same prices in
   beaded-backend/data/beads.js, and a backend test keeps the two equal. */
export const COLOURS = {
  'Dark Blue': '#00008B', 'Navy Blue': '#000080', 'Light Blue': '#ADD8E6', 'Sky Blue': '#87CEEB', 'Blue': '#0000FF',
  'Pink': '#FFB6C1', 'Purple': '#800080', 'Red': '#FF0000', 'Orange': '#FFA500', 'Yellow': '#FFD700',
  'Dark Green': '#006400', 'Light Green': '#90EE90', 'Green': '#008000', 'Moss Green': '#8A9A5B',
  'White': '#FFFFFF', 'Dirty White': '#F5F5DC', 'Black': '#000000', 'Gray': '#808080', 'Brown': '#8B4513'
};

const buildBeads = (id, type, size, price, colors) => ({ id, type, size, price, name: `${type} (${size}mm)`, colors });

export const COLLECTIONS = [
  buildBeads('rs3', 'Regular Seed', 3, 0.5, ['Dark Blue', 'Light Blue', 'Pink', 'Dark Green', 'Light Green', 'White', 'Black', 'Yellow', 'Red', 'Purple']),
  buildBeads('gs3', 'Glass Seed', 3, 0.5, ['White', 'Dirty White', 'Orange', 'Pink', 'Purple', 'Blue', 'Light Green', 'Green', 'Gray', 'Black']),
  buildBeads('ac6', 'Acrylic', 6, 1, ['Navy Blue', 'Purple', 'Pink', 'Red', 'White', 'Yellow', 'Brown', 'Moss Green', 'Orange', 'Black', 'Gray']),
  buildBeads('ac8', 'Acrylic', 8, 1, ['Navy Blue', 'Purple', 'Pink', 'Red', 'White', 'Yellow', 'Brown', 'Moss Green', 'Orange', 'Black', 'Gray']),
  buildBeads('cr8', 'Cracked', 8, 1, ['Blue', 'Purple', 'Pink', 'Red', 'White', 'Yellow', 'Brown', 'Green']),
  buildBeads('ij4', 'Imitation Jade', 4, 1, ['Dark Blue', 'Light Blue', 'Purple', 'Pink', 'Red', 'White', 'Green', 'Orange', 'Black']),
  buildBeads('ij6', 'Imitation Jade', 6, 2, ['Dark Blue', 'Light Blue', 'Purple', 'Pink', 'Red', 'Brown', 'Green', 'Gray']),
  buildBeads('ij8', 'Imitation Jade', 8, 2, ['Dark Blue', 'Light Blue', 'Purple', 'Pink', 'Red', 'Green', 'Gray']),
  buildBeads('ij10', 'Imitation Jade', 10, 3, ['Sky Blue', 'Purple', 'Pink', 'Red', 'Green', 'Brown', 'Gray', 'Black']),
  buildBeads('ce8', 'Cat Eye', 8, 2, ['Black', 'Gray', 'Brown', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Red', 'White']),
  buildBeads('ce10', 'Cat Eye', 10, 3, ['Black', 'Gray', 'Brown', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Red', 'White']),
  buildBeads('ce12', 'Cat Eye', 12, 5, ['Black', 'Gray', 'Brown', 'Blue', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Red', 'White']),
  buildBeads('ma8', 'Mermaid Acrylic', 8, 2, ['Blue', 'Green', 'Orange', 'Pink', 'Purple', 'White', 'Yellow']),
  buildBeads('ma10', 'Mermaid Acrylic', 10, 3, ['Blue', 'Green', 'Orange', 'Pink', 'Purple', 'White', 'Yellow']),
  buildBeads('ip3', 'Imitation Pearl', 3, 0.5, ['Dirty White', 'White']),
  buildBeads('ip4', 'Imitation Pearl', 4, 1, ['Dirty White', 'White']),
  buildBeads('ip6', 'Imitation Pearl', 6, 1.5, ['Dirty White', 'White']),
  buildBeads('ip8', 'Imitation Pearl', 8, 2, ['Dirty White', 'White']),
  buildBeads('ip10', 'Imitation Pearl', 10, 3, ['Dirty White', 'White']),
  buildBeads('ip12', 'Imitation Pearl', 12, 4, ['Dirty White', 'White']),
];

export const STRINGS = [
  { id: 's1', name: 'Stretchable Nylon', color: '#E8DFD3', price: 8, desc: 'Durable elastic core. Easy to slip on and off daily.' }, 
  { id: 's2', name: 'Nylon String with Lock', color: '#B0A395', price: 6, desc: 'Non-stretch string secured with a premium metal clasp.' }
];

export const CHARMS = [
  { id: 'c1', name: 'Black Cat', em: '🐈‍⬛', price: 10 },
  { id: 'c2', name: 'Pink Cat', em: '🐱', price: 10 },
  { id: 'c3', name: 'Teal Cat', em: '😸', price: 10 },
  { id: 'c4', name: 'Black Whale Tail', em: '🐋', price: 10 },
  { id: 'c5', name: 'Open Heart', em: '♡', price: 10 },
  { id: 'c6', name: 'Vintage Key', em: '🗝️', price: 10 },
  { id: 'c7', name: 'Black Flower', em: '✿', price: 10 },
  { id: 'c8', name: 'Crescent Moon', em: '🌙', price: 10 },
  { id: 'c9', name: 'Solid Heart', em: '🖤', price: 10 },
  { id: 'c10', name: 'Pink Flower', em: '🌸', price: 10 },
  { id: 'c11', name: 'Starfish', em: '⭐', price: 10 },
  { id: 'c12', name: 'Pink Whale', em: '🐳', price: 10 },
  { id: 'c13', name: 'Peach', em: '🍑', price: 10 },
  { id: 'c14', name: 'Smiley Face', em: '😊', price: 10 },
  { id: 'c15', name: 'Flamingo', em: '🦩', price: 10 },
  { id: 'c16', name: 'Hand Fan', em: '🪭', price: 10 },
  { id: 'c17', name: 'Rose', em: '🌹', price: 10 },
  { id: 'c18', name: 'Teal Butterfly', em: '🦋', price: 10 },
  { id: 'c19', name: 'Teal Whale Tail', em: '🌊', price: 10 },
  { id: 'c20', name: 'Wine Glass', em: '🍷', price: 10 },
  { id: 'c21', name: 'Green Mermaid', em: '🧜‍♀️', price: 10 },
  { id: 'c22', name: 'Cactus', em: '🌵', price: 10 },
  { id: 'c23', name: 'Green Leaf', em: '🍃', price: 10 },
  { id: 'c24', name: 'Fish Bone', em: '🐟', price: 10 },
  { id: 'c25', name: 'Strawberry', em: '🍓', price: 10 },
  { id: 'c26', name: 'Lucky Bunny', em: '🐰', price: 10 },
  { id: 'c27', name: 'Lightning Bolt', em: '⚡', price: 10 },
  { id: 'c28', name: 'Palm Tree', em: '🌴', price: 10 },
  { id: 'c29', name: 'Rainbow', em: '🌈', price: 10 },
  { id: 'c30', name: 'Happy Cloud', em: '☁️', price: 10 },
  { id: 'c31', name: 'Rainbow Flower', em: '🌻', price: 10 }
];

/* Softer versions of the catalogue colours, used only for painting beads on screen. */
export const TONES = {
  'Dark Blue': '#1F3A7A', 'Navy Blue': '#1B2A5B', 'Light Blue': '#A9D3E8', 'Sky Blue': '#86C5E6', 'Blue': '#2E7FC9',
  'Pink': '#F2A9BE', 'Purple': '#9A7BC8', 'Red': '#C8343C', 'Orange': '#EE9336', 'Yellow': '#F2C62E',
  'Dark Green': '#1F5A3E', 'Light Green': '#A6D89A', 'Green': '#3E9A5A', 'Moss Green': '#7E8F55',
  'White': '#F4F2EC', 'Dirty White': '#E9E3D2', 'Black': '#1A1A1C', 'Gray': '#8C8F95', 'Brown': '#7A4A2C'
};

export const BASE_SETTING = 25;
export const EXTENDER_PRICE = 8;
