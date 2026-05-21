import { prisma } from './db';

// Utilisateur de test pour développement sans Clerk
const TEST_USER_ID = 'test-user-001';
const TEST_USER_EMAIL = 'test@taxi-compta.local';

export async function getOrCreateUser() {
  try {
    // Chercher ou créer l'utilisateur de test
    let user = await prisma.user.findFirst({
      where: { email: TEST_USER_EMAIL },
    });

    if (!user) {
      // Créer l'utilisateur de test
      const random = Math.random().toString(36).substring(2, 10);
      const inboxEmail = `taxi-${random}@app.tax.local`;

      user = await prisma.user.create({
        data: {
          clerkId: TEST_USER_ID,
          email: TEST_USER_EMAIL,
          inboxEmail,
          name: 'Chauffeur Test',
          avatarUrl: null,
        },
      });

      // Créer subscription par défaut
      await prisma.subscription.create({
        data: {
          userId: user.id,
          status: 'free',
        },
      });

      // Créer les catégories par défaut
      const defaultCategories = [
        { name: 'Carburant', color: '#ef4444', icon: 'gas' },
        { name: 'Péage', color: '#f97316', icon: 'road' },
        { name: 'Entretien', color: '#eab308', icon: 'wrench' },
        { name: 'Assurance', color: '#22c55e', icon: 'shield' },
        { name: 'Location véhicule', color: '#06b6d4', icon: 'car' },
        { name: 'Restauration', color: '#8b5cf6', icon: 'utensils' },
        { name: 'Autres', color: '#6b7280', icon: 'folder' },
      ];

      for (const category of defaultCategories) {
        try {
          await prisma.expenseCategory.create({
            data: {
              userId: user.id,
              ...category,
            },
          });
        } catch {
          // Catégorie peut déjà exister
        }
      }
    }

    return user;
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    // Retourner un utilisateur par défaut en mémoire si la DB échoue
    return {
      id: TEST_USER_ID,
      clerkId: TEST_USER_ID,
      email: TEST_USER_EMAIL,
      inboxEmail: 'taxi-demo@app.tax.local',
      name: 'Chauffeur Test',
      avatarUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
