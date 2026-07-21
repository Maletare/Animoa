/*
  Configuration publique Animoa.
  Renseigner l’URL Supabase, la clé publique anon et le client OAuth Google Web.
  Ne jamais placer ici la clé service_role, un secret client, un mot de passe SMTP ou une autre clé privée.
*/
window.ANIMOA_CONFIG = {
  supabaseUrl: 'https://lwnhzssdtylknhidcuil.supabase.co',
  supabaseAnonKey: 'sb_publishable_IBH3lIFjYsAT80SUsEkUXw_3xjd0vy9',
  appUrl: 'https://animoa.fr',
  // Client OAuth Web Google utilisé uniquement pour connecter Google Agenda.
  // Cette valeur est publique. Ne jamais placer de secret client dans ce fichier.
  googleCalendarClientId: '824866893858-hs2pkrgsk4k0v0dr0n8ff9vjft69f9hj.apps.googleusercontent.com'
};
