import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ExtractedInvoiceData {
  supplierName: string;
  invoiceNumber: string;
  date: string;
  amountHT: number;
  amountTVA: number;
  amountTTC: number;
  category: string;
  items: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice: number;
  }>;
}

const CATEGORIES = [
  'Carburant',
  'Péage',
  'Entretien',
  'Assurance',
  'Location véhicule',
  'Restauration',
  'Autres',
];

export async function extractInvoiceData(
  pdfText: string
): Promise<ExtractedInvoiceData> {
  const prompt = `Analyse cette facture et extrais les informations comptables.
Retourne un JSON valide avec exactement cette structure:
{
  "supplierName": "nom de l'entreprise",
  "invoiceNumber": "numero de facture",
  "date": "YYYY-MM-DD",
  "amountHT": number,
  "amountTVA": number,
  "amountTTC": number,
  "category": "une des catégories: ${CATEGORIES.join(', ')}",
  "items": [
    {
      "description": "description article",
      "quantity": number ou null,
      "unitPrice": number ou null,
      "totalPrice": number
    }
  ]
}

Si une valeur est manquante, utilise 0 pour les nombres, "" pour les strings.

Facture:
${pdfText}`;

  try {
    const message = await openai.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from OpenAI');
    }

    // Parse JSON from response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const extracted: ExtractedInvoiceData = JSON.parse(jsonMatch[0]);

    // Validate category
    if (!CATEGORIES.includes(extracted.category)) {
      extracted.category = 'Autres';
    }

    return extracted;
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    throw error;
  }
}
