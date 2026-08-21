-- Rename this file to match your actual next migration number before
-- running it (checked what's already in the repo — this session can't see
-- your migrations table, so "005" is a guess).
--
-- Supabase enables row-level security on new tables by default, with no
-- policies attached. With RLS on and no SELECT policy for the anon role,
-- every query the shop and events pages make (both use the public anon
-- key, no login) returns zero rows and no error — which reads exactly
-- like "the shop is empty" even when the books table has data.
--
-- This is safe to run even if it's not the actual cause: if a policy
-- with this name already exists, Postgres will just say so, which tells
-- you RLS was already fine and the empty shop has a different cause
-- (check the browser console, and check the supabase-client.js filename
-- — see the note sent alongside this file).

alter table books enable row level security;

create policy "Public can view books"
  on books
  for select
  using (true);

alter table events enable row level security;

create policy "Public can view events"
  on events
  for select
  using (true);

-- Deliberately not touching carts, cart_items or newsletter_signups here:
-- those need policies scoped to the visitor's own anonymous session
-- (auth.uid() = carts.user_id and similar), not a blanket public read.
-- If basket.html is also showing nothing for a session that should have
-- items, that needs its own scoped policy, not this one widened.