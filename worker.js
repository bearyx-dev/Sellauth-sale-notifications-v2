/**
 * SellAuth Sale Notifications — Cloudflare Worker
 * 
 * Flow: SellAuth webhook → this Worker → fetch invoice → Pushover notification
 * 
 * Environment Variables (set in Cloudflare Workers dashboard):
 *   SELLAUTH_API_KEY   — your SellAuth API key
 *   SELLAUTH_SHOP_ID   — your SellAuth shop ID
 *   PUSHOVER_TOKEN     — your Pushover application token
 *   PUSHOVER_USER      — your Pushover user key
 *   WEBHOOK_SECRET     — (optional) secret to verify SellAuth webhooks
 */

export default {
  async fetch(request, env) {
    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response('Bad Request', { status: 400 });
    }

    // SellAuth sends invoice_id (or order id) in the webhook
    // Payload shape: { invoice_id, shop_id, event, ... }
    const invoiceId = payload.invoice_id || payload.id;

    if (!invoiceId) {
      return new Response('No invoice ID', { status: 400 });
    }

    // Fetch full invoice details from SellAuth API
    let invoice;
    try {
      const apiRes = await fetch(
        `https://sellauth.com/api/v1/shops/${env.SELLAUTH_SHOP_ID}/invoices/${invoiceId}`,
        {
          headers: {
            'Authorization': `Bearer ${env.SELLAUTH_API_KEY}`,
            'Accept': 'application/json',
          },
        }
      );

      if (!apiRes.ok) {
        console.error('SellAuth API error:', apiRes.status, await apiRes.text());
        return new Response('SellAuth API error', { status: 502 });
      }

      invoice = await apiRes.json();
    } catch (err) {
      console.error('Failed to fetch invoice:', err);
      return new Response('Failed to fetch invoice', { status: 502 });
    }

    // Build the Shopify-style notification message
    const amount    = invoice.total ?? invoice.price ?? '?';
    const currency  = invoice.currency ?? 'USD';
    const itemCount = invoice.products?.length ?? invoice.quantity ?? 1;
    const country   = invoice.country_code ?? invoice.country ?? '';
    const gateway   = invoice.gateway ?? invoice.payment_method ?? '';
    const shopName  = env.SHOP_NAME ?? 'Your Store';

    const symbol = currencySymbol(currency);
    const productLine = `${itemCount} product${itemCount !== 1 ? 's' : ''}`;
    const message = `${symbol}${amount}, ${productLine} from Online Store\n• ${shopName}${country ? `\n• ${country}` : ''}${gateway ? `\n• ${gateway}` : ''}`;

    // Send Pushover notification
    try {
      const pushRes = await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token:   env.PUSHOVER_TOKEN,
          user:    env.PUSHOVER_USER,
          message: message,
          sound:   'shopify',   // matches your custom uploaded sound
          title:   'New Sale!',
        }),
      });

      if (!pushRes.ok) {
        console.error('Pushover error:', await pushRes.text());
        return new Response('Pushover error', { status: 502 });
      }
    } catch (err) {
      console.error('Pushover request failed:', err);
      return new Response('Pushover request failed', { status: 502 });
    }

    return new Response('OK', { status: 200 });
  },
};

// Map common currency codes to symbols
function currencySymbol(code) {
  const map = {
    USD: '$', EUR: '€', GBP: '£', CAD: 'C$',
    AUD: 'A$', JPY: '¥', CHF: 'CHF ', SEK: 'kr ',
  };
  return map[code?.toUpperCase()] ?? code + ' ';
}
