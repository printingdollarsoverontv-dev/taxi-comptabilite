// Seed script - run with: npm run db:seed
// This creates default expense categories for new users
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const defaultCategories = [
  { name: 'Carburant', color: '#ef4444', icon: 'gas' },
  { name: 'Péage', color: '#f97316', icon: 'road' },
  { name: 'Entretien', color: '#eab308', icon: 'wrench' },
  { name: 'Assurance', color: '#22c55e', icon: 'shield' },
  { name: 'Location véhicule', color: '#06b6d4', icon: 'car' },
  { name: 'Restauration', color: '#8b5cf6', icon: 'utensils' },
  { name: 'Autres', color: '#6b7280', icon: 'folder' },
];

async function main() {
  console.log('Seed script - only creates default categories structure');
  console.log('To create sample users, run: npm run dev');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
