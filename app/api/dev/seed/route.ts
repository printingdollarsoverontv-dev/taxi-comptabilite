import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Trouver ou créer l'utilisateur de test
    let user = await prisma.user.findFirst({
      where: { email: 'test@taxi-compta.local' },
    });

    if (!user) {
      // Créer l'utilisateur s'il n'existe pas
      const random = Math.random().toString(36).substring(2, 10);
      user = await prisma.user.create({
        data: {
          clerkId: 'test-user-001',
          email: 'test@taxi-compta.local',
          inboxEmail: `taxi-${random}@app.tax.local`,
          name: 'Chauffeur Test',
        },
      });

      // Créer la subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          status: 'free',
        },
      });
    }

    // Données de factures de test
    const testInvoices = [
      {
        invoiceNumber: 'SHELL-2024-001',
        supplierName: 'Shell Station - Paris',
        category: 'Carburant',
        date: new Date('2024-01-15'),
        amountHT: 50.0,
        amountTVA: 10.5,
        amountTTC: 60.5,
        items: [
          {
            description: 'Essence Super 95 - 50L',
            quantity: 50,
            unitPrice: 1.2,
            totalPrice: 60.5,
          },
        ],
      },
      {
        invoiceNumber: 'TOLL-2024-0456',
        supplierName: 'SANEF Péages',
        category: 'Péage',
        date: new Date('2024-01-18'),
        amountHT: 45.0,
        amountTVA: 8.55,
        amountTTC: 53.55,
        items: [
          {
            description: 'Péage autoroute A6 Paris-Lyon',
            quantity: 1,
            unitPrice: 53.55,
            totalPrice: 53.55,
          },
        ],
      },
      {
        invoiceNumber: 'MECANIQUE-789',
        supplierName: 'Garage Dupont - Mécanique',
        category: 'Entretien',
        date: new Date('2024-01-20'),
        amountHT: 150.0,
        amountTVA: 31.5,
        amountTTC: 181.5,
        items: [
          {
            description: 'Révision complète + pneus',
            quantity: 1,
            unitPrice: 181.5,
            totalPrice: 181.5,
          },
        ],
      },
      {
        invoiceNumber: 'ASSURANCE-2024',
        supplierName: 'AXA Assurance',
        category: 'Assurance',
        date: new Date('2024-01-25'),
        amountHT: 400.0,
        amountTVA: 0.0,
        amountTTC: 400.0,
        items: [
          {
            description: 'Assurance auto - 1 trimestre',
            quantity: 1,
            unitPrice: 400.0,
            totalPrice: 400.0,
          },
        ],
      },
      {
        invoiceNumber: 'REST-2024-0123',
        supplierName: 'Café Le Central',
        category: 'Restauration',
        date: new Date('2024-01-28'),
        amountHT: 25.0,
        amountTVA: 5.0,
        amountTTC: 30.0,
        items: [
          {
            description: 'Déjeuner chauffeur',
            quantity: 1,
            unitPrice: 30.0,
            totalPrice: 30.0,
          },
        ],
      },
    ];

    // Ajouter les factures
    for (const invoice of testInvoices) {
      await prisma.invoice.create({
        data: {
          userId: user.id,
          invoiceNumber: invoice.invoiceNumber,
          supplierName: invoice.supplierName,
          category: invoice.category,
          date: invoice.date,
          amountHT: invoice.amountHT,
          amountTVA: invoice.amountTVA,
          amountTTC: invoice.amountTTC,
          extractionStatus: 'completed',
          items: {
            create: invoice.items,
          },
        },
      });
    }

    return NextResponse.json({
      message: '✅ 5 factures de test ajoutées! Retourne au Dashboard pour voir les stats actualisées.',
      invoicesAdded: testInvoices.length,
      stats: {
        totalAmount: testInvoices.reduce((sum, inv) => sum + inv.amountTTC, 0),
        totalTVA: testInvoices.reduce((sum, inv) => sum + inv.amountTVA, 0),
      },
    });
  } catch (error) {
    console.error('Error seeding test data:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout des factures' },
      { status: 500 }
    );
  }
}
