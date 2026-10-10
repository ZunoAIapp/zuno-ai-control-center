// ZUNO AI — Supabase Client

const SUPABASE_URL =
  "https://kbznazylczhyztoyixet.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_KEcvbSYtVPGLbTFD_yIqIQ_K5p5533_";

if (!window.supabase || !window.supabase.createClient) {
  console.error(
    "ZUNO AI: Supabase library is missing."
  );
} else {
  const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );

  window.ZUNO_SUPABASE = {
    url: SUPABASE_URL,
    client: supabaseClient,
    ready: true
  };

  console.log(
    "ZUNO AI: Supabase client initialized."
  );
}
