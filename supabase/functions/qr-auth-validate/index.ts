/**
 * qr-auth-validate — passwordless QR-card login for seniors.
 *
 * The physical card carries a card_id. This function (service role) maps
 * card → user, generates a one-time magic-link token hash, and returns it;
 * the client completes the session with supabase.auth.verifyOtp().
 * No email, no password, no seed phrase — a 75-year-old taps a card.
 */
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import { corsHeaders, json } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    const { card_id } = (await req.json().catch(() => ({}))) as { card_id?: string };
    if (!card_id) return json({ error: 'card_id_required' }, 400);

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: card } = await admin
      .from('qr_cards')
      .select('user_id, active')
      .eq('card_id', card_id)
      .maybeSingle();
    if (!card || !card.active) return json({ error: 'unknown_card' }, 404);

    const { data: userData, error: userError } = await admin.auth.admin.getUserById(
      card.user_id as string,
    );
    if (userError || !userData.user?.email) return json({ error: 'unknown_card' }, 404);

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
    });
    if (linkError || !linkData.properties?.hashed_token) {
      return json({ error: 'link_generation_failed' }, 500);
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('display_name')
      .eq('id', card.user_id as string)
      .maybeSingle();

    return json({
      token_hash: linkData.properties.hashed_token,
      display_name: profile?.display_name ?? 'Player',
    });
  } catch (err) {
    console.error('qr-auth-validate failed', err);
    return json({ error: 'internal_error' }, 500);
  }
});
