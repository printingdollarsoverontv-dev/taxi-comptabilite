import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Récupérer tous les users
    const users = await prisma.user.findMany();

    // Récupérer toutes les invoices
    const invoices = await prisma.invoice.findMany();

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        inboxEmail: u.inboxEmail,
        name: u.name,
      })),
      totalUsers: users.length,
      invoices: invoices.map(i => ({
        id: i.id,
        supplierName: i.supplierName,
        amountTTC: i.amountTTC,
        category: i.category,
      })),
      totalInvoices: invoices.length,
      totalAmount: invoices.reduce((sum, inv) => sum + inv.amountTTC, 0),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    });
  }
}
