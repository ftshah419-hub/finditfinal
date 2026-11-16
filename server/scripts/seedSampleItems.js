import { connectDB, disconnectDB } from '../src/config/database.js';
import User from '../src/models/User.js';
import Category from '../src/models/Category.js';
import Item from '../src/models/Item.js';
import AIMatch from '../src/models/AIMatch.js';
import Notification from '../src/models/Notification.js';

async function seed() {
  console.log('[Seed Items] Connecting to database...');
  await connectDB();

  let user = await User.findOne({});
  if (!user) {
    console.error('No user found');
    await disconnectDB();
    return;
  }

  const electronics = await Category.findOne({ name: 'Electronics' });
  const sports = await Category.findOne({ name: 'Sports & Fitness' });
  const wallets = await Category.findOne({ name: 'Wallets & Money' });
  const keys = await Category.findOne({ name: 'Keys & Access Cards' });

  const sampleItems = [
    {
      title: 'Sony WH-1000XM5 Noise-Canceling Headphones',
      description: 'Silver finish, original hard case included. Discovered on 3rd floor study bench in Engineering Hall.',
      type: 'FOUND',
      categoryId: electronics._id,
      reportedBy: user._id,
      itemDate: new Date('2026-11-14T10:15:00.000Z'),
      location: {
        address: 'Engineering Hall, Lab 302 Desk 4',
        city: 'Central Campus',
        state: 'Campus State'
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
          publicId: 'sample_sony_headphones'
        }
      ],
      status: 'APPROVED'
    },
    {
      title: 'Apple iPad Air (Sky Blue, 64GB)',
      description: 'Discovered left behind at 4th floor quiet study cubicle. Currently stored in locked safe at Main Campus Security Desk.',
      type: 'FOUND',
      categoryId: electronics._id,
      reportedBy: user._id,
      itemDate: new Date('2026-11-13T14:30:00.000Z'),
      location: {
        address: 'Central Library, 4th Floor Study Cube 14',
        city: 'Central Campus',
        state: 'Campus State'
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80',
          publicId: 'sample_ipad_air'
        }
      ],
      status: 'APPROVED'
    },
    {
      title: 'Brown Leather Bifold Wallet',
      description: 'Contains campus ID card initials J.M. Turned over to dining supervisor at Central Cafeteria North.',
      type: 'FOUND',
      categoryId: wallets._id,
      reportedBy: user._id,
      itemDate: new Date('2026-11-12T13:20:00.000Z'),
      location: {
        address: 'Central Cafeteria North Dining Hall',
        city: 'Central Campus',
        state: 'Campus State'
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
          publicId: 'sample_leather_wallet'
        }
      ],
      status: 'APPROVED'
    },
    {
      title: 'Matte Black Hydro Flask (32oz)',
      description: '32oz wide mouth with flex cap. Has small engineering guild holographic decal. Lost near indoor basketball courts.',
      type: 'LOST',
      categoryId: sports._id,
      reportedBy: user._id,
      itemDate: new Date('2026-11-11T16:40:00.000Z'),
      location: {
        address: 'Recreation Gym Courts, Locker Area 2',
        city: 'South Athletic Quad',
        state: 'Campus State'
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
          publicId: 'sample_hydro_flask'
        }
      ],
      status: 'APPROVED'
    },
    {
      title: 'Tesla Key Fob with Silver Carabiner',
      description: 'Black vehicle key fob with campus key on silver aluminum carabiner clip. Lost near paved walkway.',
      type: 'LOST',
      categoryId: keys._id,
      reportedBy: user._id,
      itemDate: new Date('2026-11-10T09:15:00.000Z'),
      location: {
        address: 'North Parking Structure Level 2',
        city: 'Transit Zone',
        state: 'Campus State'
      },
      images: [
        {
          url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
          publicId: 'sample_key_fob'
        }
      ],
      status: 'APPROVED'
    }
  ];

  for (const itemData of sampleItems) {
    const existing = await Item.findOne({ title: itemData.title });
    if (!existing) {
      await Item.create(itemData);
      console.log(`  + Seeded Item: "${itemData.title}"`);
    } else {
      console.log(`  = Item already exists: "${itemData.title}"`);
    }
  }

  // Also add a sample notification
  const notifExisting = await Notification.findOne({ recipientId: user._id });
  if (!notifExisting) {
    await Notification.create({
      recipientId: user._id,
      title: 'Campus Network Online',
      message: 'Welcome to FINDIT. All campus recovery depots and neural intake desks are operational.',
      type: 'SYSTEM',
      isRead: false
    });
    console.log('  + Seeded welcome notification');
  }

  console.log('[Seed Items] Completed!');
  await disconnectDB();
}

seed().catch(console.error);
