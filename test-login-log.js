require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!supabaseUrl || !serviceKey) { console.error("No env vars", process.env.NEXT_PUBLIC_SUPABASE_URL); process.exit(1); }
const supabase = createClient(supabaseUrl, serviceKey, {
  realtime: { transport: WebSocket }
});
async function test() {
  const { data, error } = await supabase.from('login_logs').insert({
    user_id: '752d034d-d80a-48ea-bd78-9568b68b7f72',
    username: 'test',
    ip_address: '127.0.0.1',
    user_agent: 'test',
    created_at: new Date().toISOString()
  });
  console.log('Error:', error);
  console.log('Data:', data);
}
test();
