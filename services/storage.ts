import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadFile(
  userId: string,
  filename: string,
  buffer: Buffer
): Promise<string> {
  const path = `${userId}/${Date.now()}-${filename}`;

  const { data, error } = await supabase.storage
    .from('invoices')
    .upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload error: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('invoices').getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteFile(userId: string, path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('invoices')
    .remove([path]);

  if (error) {
    throw new Error(`Storage delete error: ${error.message}`);
  }
}
