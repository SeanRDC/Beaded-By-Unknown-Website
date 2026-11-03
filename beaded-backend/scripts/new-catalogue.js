/* Replaces the first three showcase products with the November 2026 collection.
   Uploads each photo to Cloudinary, adds the Pin and Hair Clip categories, removes the old
   pieces and creates the new ones. Prints what it would do. Writes only with --apply.
   Pieces that already exist keep their photos and only get their words and price refreshed,
   so it is safe to run again.

   node scripts/new-catalogue.js <folder with the photos>
   node scripts/new-catalogue.js <folder with the photos> --apply */
require('dotenv').config({ quiet: true });
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

const Product = require('../models/Product');
const Settings = require('../models/Settings');

const FOLDER = 'beaded_by_unknown';
const RETIRED = ['Basic Beads Bracelet', 'Glossy Beads Bracelet', 'November Necklace'];
const NEW_CATEGORIES = ['Pin', 'Hair Clip'];
const ONE_SIZE = ['One size'];

const PIECES = [
  {
    slug: 'painters-palette-necklace', name: "Painter's Palette Necklace", price: 385, cat: 'Necklace',
    mat: 'Cat eye beads, pearls, gold-tone chain',
    desc: 'Two swags of gold chain hung with sky-blue cat eye beads and pearl drops, finished with a tiny painter\'s palette.'
  },
  {
    slug: 'mermaids-cove-necklace', name: "Mermaid's Cove Necklace", price: 295, cat: 'Necklace',
    mat: 'Shell, star and glass beads, silver-tone chain',
    desc: 'Pale shells, iridescent stars and a crystal drop on a fine silver chain, like something the tide left behind.'
  },
  {
    slug: 'olive-grove-bracelet-set', name: 'Olive Grove Bracelet Set', price: 220, cat: 'Bracelet',
    mat: 'Glass beads on stretch cord',
    desc: 'A pair of stretch bracelets in olive, smoke and deep green glass. Wear them stacked or share one.'
  },
  {
    slug: 'lilac-cat-eye-bracelet', name: 'Lilac Cat Eye Bracelet', price: 165, cat: 'Bracelet',
    mat: 'Cat eye beads, gold-tone links',
    desc: 'Glowing lilac cat eye beads linked one by one in gold, with a chain to fit any wrist.'
  },
  {
    slug: 'melody-hair-clips', name: 'Melody Hair Clips', price: 180, cat: 'Hair Clip', sizes: ONE_SIZE,
    mat: 'Snap clips, glass beads, silver-tone charms',
    desc: 'A pair of black snap clips trailing hearts, a flower, a pearl and a little treble clef.',
    flatlay: true
  },
  {
    slug: 'encore-pin', name: 'Encore Pin', price: 145, cat: 'Pin', sizes: ONE_SIZE,
    mat: 'Safety pin, glass beads, charms',
    desc: 'A safety pin for your bag or jacket, hung with a microphone, a laptop and a slice of strawberry cake.',
    flatlay: true
  },
  {
    slug: 'sun-and-tide-bracelet-set', name: 'Sun and Tide Bracelet Set', price: 120, cat: 'Bracelet',
    mat: 'Seed beads',
    desc: 'Two seed bead bracelets, one sunny yellow and white, one in every blue of the sea.'
  },
  {
    slug: 'seafoam-phone-strap', name: 'Seafoam Phone Strap', price: 175, cat: 'Phone Strap', sizes: ONE_SIZE,
    mat: 'Pearls, shells and glass beads',
    desc: 'A long strap of pearls, shells, stars and frosted glass that loops onto your phone case.',
    flatlay: true
  },
  {
    slug: 'pearl-bow-keychain', name: 'Pearl Bow Keychain', price: 150, cat: 'Keychain', sizes: ONE_SIZE,
    mat: 'Faux pearls, pink clasp',
    desc: 'A bow shaped from glossy pearls, with a pink bead at its heart and a pink clasp to clip anywhere.'
  },
  {
    slug: 'balloon-pup-keychain', name: 'Balloon Pup Keychain', price: 110, cat: 'Keychain', sizes: ONE_SIZE,
    mat: 'Resin charm, pink clasp',
    desc: 'A pearly pink balloon dog on a pink chain. Small enough for keys, bright enough to find them.'
  },
  {
    slug: 'ruby-heart-necklace', name: 'Ruby Heart Necklace', price: 285, cat: 'Necklace',
    mat: 'Pearls, red glass, silver-tone hearts',
    desc: 'Pearls and red glass hearts set in silver frames, ending in a glossy red heart and a pearl drop.'
  },
  {
    slug: 'xoxo-butterfly-bracelet', name: 'Xoxo Butterfly Bracelet', price: 160, cat: 'Bracelet',
    mat: 'Pink glass beads, silver-tone links',
    desc: 'Every pink I own on one bracelet: a butterfly, a star, linked hearts and a heart cage charm.'
  },
  {
    slug: 'lily-bow-phone-charms', name: 'Lily Bow Phone Charms', price: 170, cat: 'Phone Charm', sizes: ONE_SIZE,
    mat: 'Frosted beads, pearls, glass hearts',
    desc: 'A pair of phone charms, one lilac and one pink, each a frosted bow with a lily, a pearl and a heart.'
  },
  {
    slug: 'lucky-eight-bracelet', name: 'Lucky Eight Bracelet', price: 165, cat: 'Bracelet',
    mat: 'Glass beads, pearls, stretch cord',
    desc: 'Smoky grey glass and pearls with silver clovers and a little eight ball, for luck.'
  },
  {
    slug: 'north-star-necklace', name: 'North Star Necklace', price: 210, cat: 'Necklace',
    mat: 'Silver-tone chain, glass bead, charms',
    desc: 'A fine silver chain with a frosted bead and a safety pin holding a four-point star.',
    flatlay: true
  },
  {
    slug: 'four-leaf-pin', name: 'Four-Leaf Pin', price: 120, cat: 'Pin', sizes: ONE_SIZE,
    mat: 'Safety pin, glass beads, resin drop',
    desc: 'Green glass beads and a real-look four-leaf clover sealed in a clear teardrop, on a safety pin.',
    flatlay: true
  },
  {
    slug: 'pearl-station-bracelet', name: 'Pearl Station Bracelet', price: 150, cat: 'Bracelet',
    mat: 'Faux pearls, silver-tone chain',
    desc: 'Five pearls spaced along a fine silver chain. Simple enough to wear every day.'
  }
];

function upload(file, slug) {
  return cloudinary.uploader.upload(file, { folder: FOLDER, public_id: slug, overwrite: true, resource_type: 'image' }).then((result) => result.secure_url);
}

async function main() {
  const [folder] = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
  const apply = process.argv.includes('--apply');
  if (!folder) throw new Error('Give the folder that holds the photos.');

  for (const piece of PIECES) {
    for (const file of [`${piece.slug}.jpg`, ...(piece.flatlay ? [`${piece.slug}-flatlay.jpg`] : [])]) {
      if (!fs.existsSync(path.join(folder, file))) throw new Error(`Missing photo: ${file}`);
    }
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  await mongoose.connect(process.env.MONGODB_URI);

  const settings = await Settings.findOne();
  const missing = NEW_CATEGORIES.filter((cat) => !settings.categories.includes(cat));
  console.log(missing.length ? `Categories to add: ${missing.join(', ')}` : 'Categories: already there');
  if (apply && missing.length) {
    settings.categories.push(...missing);
    await settings.save();
  }

  const retired = await Product.find({ name: { $in: RETIRED } });
  console.log(`Old pieces to remove: ${retired.map((p) => p.name).join(', ') || 'none'}`);
  if (apply && retired.length) await Product.deleteMany({ _id: { $in: retired.map((p) => p._id) } });

  for (const { slug, flatlay, ...fields } of PIECES) {
    const existing = await Product.findOne({ name: fields.name });
    if (existing) {
      console.log(`${fields.name}: already in the shop, words and price refreshed`);
      if (apply) {
        existing.set({ sizes: [], ...fields });
        await existing.save();
      }
      continue;
    }
    console.log(`${fields.name}: ₱${fields.price}, ${fields.cat}${flatlay ? ', with a second picture' : ''}`);
    if (!apply) continue;
    const img = await upload(path.join(folder, `${slug}.jpg`), slug);
    const img2 = flatlay ? await upload(path.join(folder, `${slug}-flatlay.jpg`), `${slug}-flatlay`) : undefined;
    await Product.create({ ...fields, img, ...(img2 ? { img2 } : {}) });
  }

  console.log(apply ? 'Saved.' : 'Dry run. Nothing was saved or uploaded. Add --apply to write these changes.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(`Failed: ${err.message}`);
  process.exitCode = 1;
});
