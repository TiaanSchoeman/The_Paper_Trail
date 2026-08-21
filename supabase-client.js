const SUPABASE_URL = "https://vwgcrboinicarivabbvd.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3Z2NyYm9pbmljYXJpdmFiYnZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTQ5NjAsImV4cCI6MjEwMjg3MDk2MH0.luV-5_16p_WmJGdtn_EOOqznp5GqtpordG3RqZsCoUo"; // Project Settings > API — safe to expose client-side

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Ensure every visitor has a session (anonymous auth) so their cart persists
// across page loads/devices-not-required. Call this once on page load.
async function ensureSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return session;
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

// Get (or create) the current user's cart row
async function getOrCreateCart() {
  const { data: { user } } = await supabase.auth.getUser();
  let { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!cart) {
    const { data: newCart, error } = await supabase
      .from("carts")
      .insert({ user_id: user.id })
      .select("id")
      .single();
    if (error) throw error;
    cart = newCart;
  }
  return cart.id;
}

// ---- CATALOG ----
async function fetchBooks({ newOnly = false } = {}) {
  let query = supabase.from("books").select("*").order("created_at", { ascending: false });
  if (newOnly) query = query.eq("is_new", true);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ---- CART ----
async function addToCart(bookId, quantity = 1) {
  const cartId = await getOrCreateCart();
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase
      .from("cart_items")
      .insert({ cart_id: cartId, book_id: bookId, quantity });
  }
}

async function getCart() {
  const cartId = await getOrCreateCart();
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, quantity, books ( id, title, author, price_cents, image_url )")
    .eq("cart_id", cartId);
  if (error) throw error;
  return data;
}

async function removeFromCart(cartItemId) {
  await supabase.from("cart_items").delete().eq("id", cartItemId);
}

async function updateCartQuantity(cartItemId, quantity) {
  if (quantity <= 0) return removeFromCart(cartItemId);
  await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId);
}

// ---- CHECKOUT ----
async function checkout({ email, name }) {
  const { data: orderId, error } = await supabase.rpc("checkout_cart", {
    p_customer_email: email,
    p_customer_name: name,
  });
  if (error) throw error;
  return orderId;
}

// ---- NEWSLETTER ----
async function signUpNewsletter(email) {
  const { error } = await supabase.from("newsletter_signups").insert({ email });
  if (error) throw error;
}
