import { prisma } from '@/lib/db';
import { extractTextFromPDFBuffer } from '@/services/pdf';
import { extractInvoiceData } from '@/services/extraction';
import { uploadFile } from '@/services/storage';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

async function verifyMailgunSignature(
  request: Request,
  body: FormData
): Promise<boolean> {
  const timestamp = body.get('timestamp') as string;
  const token = body.get('token') as string;
  const signature = body.get('signature') as string;

  const secret = process.env.MAILGUN_WEBHOOK_SECRET;
  if (!secret) return false;

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}${token}`)
    .digest('hex');

  return hmac === signature;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Verify Mailgun signature
    const isValid = await verifyMailgunSignature(request, formData);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Extract email data
    const from = formData.get('from') as string;
    const to = formData.get('recipient') as string;
    const subject = formData.get('subject') as string;
    const bodyMime = formData.get('body-mime') as string;
    const bodyPlain = formData.get('body-plain') as string;

    // Find user by inbox email
    const user = await prisma.user.findUnique({
      where: { inboxEmail: to },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check subscription (free users: 10 invoices/month)
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (subscription?.status === 'free') {
      const thisMonth = new Date();
      thisMonth.setDate(1);

      const invoicesThisMonth = await prisma.invoice.count({
        where: {
          userId: user.id,
          createdAt: { gte: thisMonth },
        },
      });

      if (invoicesThisMonth >= 10) {
        return NextResponse.json(
          { error: 'Free tier limit reached' },
          { status: 403 }
        );
      }
    }

    // Create email record
    const email = await prisma.email.create({
      data: {
        userId: user.id,
        messageId: formData.get('message-id') as string,
        from,
        subject,
        body: bodyMime || bodyPlain || '',
        plainText: bodyPlain,
      },
    });

    // Process attachments
    const attachmentCount = Object.keys(Object.fromEntries(formData))
      .filter(key => key.startsWith('attachment-'))
      .length;

    let invoiceCount = 0;

    for (let i = 1; i <= attachmentCount; i++) {
      const attachment = formData.get(`attachment-${i}`) as File;
      if (!attachment) continue;

      const buffer = Buffer.from(await attachment.arrayBuffer());

      // Only process PDFs
      if (!attachment.type.includes('pdf')) continue;

      try {
        // Save attachment
        const storageUrl = await uploadFile(user.id, attachment.name, buffer);

        // Extract PDF text
        const pdfText = await extractTextFromPDFBuffer(buffer);

        // Extract invoice data with OpenAI
        const invoiceData = await extractInvoiceData(pdfText);

        // Create invoice record
        const invoice = await prisma.invoice.create({
          data: {
            userId: user.id,
            emailId: email.id,
            category: invoiceData.category,
            invoiceNumber: invoiceData.invoiceNumber,
            supplierName: invoiceData.supplierName,
            date: invoiceData.date ? new Date(invoiceData.date) : null,
            amountHT: invoiceData.amountHT,
            amountTVA: invoiceData.amountTVA,
            amountTTC: invoiceData.amountTTC,
            extractionStatus: 'completed',
            items: {
              create: invoiceData.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
              })),
            },
          },
        });

        invoiceCount++;

        // Save attachment record
        await prisma.emailAttachment.create({
          data: {
            emailId: email.id,
            filename: attachment.name,
            size: buffer.length,
            mimetype: attachment.type,
            storageUrl,
          },
        });
      } catch (error) {
        console.error('Error processing attachment:', error);

        // Create invoice with error status
        await prisma.invoice.create({
          data: {
            userId: user.id,
            emailId: email.id,
            category: 'Autres',
            extractionStatus: 'failed',
            extractionError: `Erreur lors de l'extraction: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          },
        });
      }
    }

    // Update email status
    await prisma.email.update({
      where: { id: email.id },
      data: {
        status: invoiceCount > 0 ? 'processed' : 'no_invoices',
        attachmentCount: invoiceCount,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      invoicesProcessed: invoiceCount,
    });
  } catch (error) {
    console.error('Mailgun webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
