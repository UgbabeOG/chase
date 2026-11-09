import { initializeDatabase, seedDatabase } from './index.js';
await initializeDatabase();
await seedDatabase();
console.log('Database seeding complete.');
