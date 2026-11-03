/* One-time update of the showcase products: realistic prices, real categories and descriptions.
   Prints what would change. Writes only with --apply.

   node scripts/showcase-catalog.js
   node scripts/showcase-catalog.js --apply */
require('dotenv').config();
const mongoose = require('mongoose');

const Product = require('../models/Product');

const CHANGES = [
  {
    id: '69ee3c0c758fbf56e6af0601',
    price: 65,
    cat: 'Bracelet',
    mat: 'Seed beads',
    desc: 'Bright seed beads in two runs of colour, strung by hand.'
  },
  {
    id: '69ee3bee758fbf56e6af05f8',
    price: 85,
    cat: 'Bracelet',
    mat: 'Glass seed beads',
    desc: 'Glossy glass seed beads in soft pink and pale blue.'
  },
  {
    id: '69f4aa65d7557e08c69fb7f8',
    price: 185,
    cat: 'Necklace',
    mat: 'Glass, acrylic and imitation stone beads, flower pendant',
    desc: 'Grey and black beads with clear bicones, finished with a black flower pendant.'
  }
];

async function main() {
  const apply = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGODB_URI);

  for (const { id, ...changes } of CHANGES) {
    const product = await Product.findById(id);
    if (!product) {
      console.log(`${id}: not found, skipped`);
      continue;
    }
    console.log(`${product.name}: ₱${product.price} ${product.cat} -> ₱${changes.price} ${changes.cat}`);
    if (apply) {
      product.set(changes);
      await product.save();
    }
  }

  console.log(apply ? 'Saved.' : 'Dry run. Nothing was saved. Add --apply to write these changes.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(`Failed: ${err.name}`);
  process.exitCode = 1;
});
