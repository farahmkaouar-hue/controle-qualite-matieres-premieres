import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Singleton client Supabase
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!supabaseClient) {
    const supabaseUrl = `https://${projectId}.supabase.co`;
    supabaseClient = createSupabaseClient(supabaseUrl, publicAnonKey);
  }
  return supabaseClient;
}

// Helper pour les appels API au serveur
export async function callServer<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-b3b7bc95${endpoint}`,
      {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`,
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur serveur (${endpoint}):`, errorText);
      return { data: null, error: errorText || 'Erreur serveur' };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error(`Erreur réseau (${endpoint}):`, error);
    return { data: null, error: String(error) };
  }
}
