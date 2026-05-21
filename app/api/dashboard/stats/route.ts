import { getOrCreateUser } from '@/lib/clerk';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await getOrCreateUser();

    const invoices = await prisma.invoice.findMany({
      where: { userId: user.id },
    });

    const totalExpenses = invoices.reduce((sum, inv) => sum + inv.amountTTC, 0);
    const totalTVA = invoices.reduce((sum, inv) => sum + inv.amountTVA, 0);

    const categoryBreakdown = invoices.reduce(
      (acc, inv) => {
        acc[inv.category] = (acc[inv.category] || 0) + inv.amountTTC;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      totalInvoices: invoices.length,
      totalExpenses,
      totalTVA,
      categoryBreakdown,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
