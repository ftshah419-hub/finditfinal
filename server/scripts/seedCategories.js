import { connectDB, disconnectDB } from '../src/config/database.js';
import Category from '../src/models/Category.js';
import User from '../src/models/User.js';

const defaultCategories = [
  { name: 'Electronics', description: 'Laptops, phones, tablets, chargers, headphones, and electronic devices' },
  { name: 'Keys & Access Cards', description: 'Vehicle keys, dorm keys, smart cards, key fobs, and RFID tags' },
  { name: 'Bags & Luggage', description: 'Backpacks, duffle bags, messenger bags, suitcases, and totes' },
  { name: 'Jewelry & Watches', description: 'Rings, wristwatches, smart bands, necklaces, and bracelets' },
  { name: 'Wallets & Money', description: 'Leather bifold wallets, cardholders, purses, and currency' },
  { name: 'Documents & IDs', description: 'Passports, campus student IDs, driving licenses, and certificates' },
  { name: 'Books & Study Materials', description: 'Textbooks, notebooks, binders, lab manuals, and calculators' },
  { name: 'Clothing & Accessories', description: 'Jackets, hoodies, caps, umbrellas, scarves, and sunglasses' },
  { name: 'Sports & Fitness', description: 'Water bottles, gym equipment, yoga mats, and sports gear' },
  { name: 'Other Personal Item', description: 'Miscellaneous personal belongings not covered in standard categories' }
];

async function seed() {
  console.log('[Seed] Connecting to database...');
  await connectDB();

  let adminUser = await User.findOne({ role: 'ADMIN' });
  if (!adminUser) {
    adminUser = await User.findOne({});
  }

  if (!adminUser) {
    console.error('[Seed] No user found in database to associate category creation.');
    await disconnectDB();
    process.exit(1);
  }

  console.log(`[Seed] Using user ${adminUser.email} (${adminUser._id}) as category creator.`);

  for (const cat of defaultCategories) {
    const existing = await Category.findOne({ name: cat.name });
    if (!existing) {
      await Category.create({
        name: cat.name,
        description: cat.description,
        isActive: true,
        createdBy: adminUser._id
      });
      console.log(`  + Created category: "${cat.name}"`);
    } else {
      console.log(`  = Category already exists: "${cat.name}"`);
    }
  }

  console.log('[Seed] Categories seeded successfully!');
  await disconnectDB();
}

seed().catch((err) => {
  console.error('[Seed] Error:', err);
  process.exit(1);
});
