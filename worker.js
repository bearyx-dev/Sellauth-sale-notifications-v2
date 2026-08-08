export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/test' && request.method === 'GET') {
      const shopName = env.SHOP_NAME ?? 'Your Store';
      const message  = `€29.99, 1 product from Online Store\n• ${shopName}`;

      const pushRes = await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token:   env.PUSHOVER_TOKEN,
          user:    env.PUSHOVER_USER,
          message: message,
          sound:   'shopify',
          title:   '🧪 Test Notification',
        }),
      });

      if (!pushRes.ok) {
        const err = await pushRes.text();
        return new Response(`Pushover error: ${err}`, { status: 502 });
      }

      return new Response('✅ Test notification sent! Check your phone.', { status: 200 });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response('Bad Request', { status: 400 });
    }

    const invoiceId = payload.invoice_id || payload.id;
    if (!invoiceId) {
      return new Response('No invoice ID', { status: 400 });
    }

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
        return new Response('SellAuth API error', { status: 502 });
      }

      invoice = await apiRes.json();
    } catch {
      return new Response('Failed to fetch invoice', { status: 502 });
    }

    const amount    = invoice.total ?? invoice.price ?? '?';
    const currency  = invoice.currency ?? 'USD';
    const itemCount = invoice.products?.length ?? invoice.quantity ?? 1;
    const country   = invoice.country_code ?? invoice.country ?? '';
    const gateway   = invoice.gateway ?? invoice.payment_method ?? '';
    const shopName  = env.SHOP_NAME ?? 'Your Store';

    const symbol      = currencySymbol(currency);
    const productLine = `${itemCount} product${itemCount !== 1 ? 's' : ''}`;
    const message     = `${symbol}${amount}, ${productLine} from Online Store\n• ${shopName}`;

    try {
      const pushRes = await fetch('https://api.pushover.net/1/messages.json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token:   env.PUSHOVER_TOKEN,
          user:    env.PUSHOVER_USER,
          message: message,
          sound:   'shopify',
          title:   'New Sale!',
        }),
      });

      if (!pushRes.ok) {
        return new Response('Pushover error', { status: 502 });
      }
    } catch {
      return new Response('Pushover request failed', { status: 502 });
    }

    return new Response('OK', { status: 200 });
  },
};

function currencySymbol(code) {
  const map = {
    USD: '$', EUR: '€', GBP: '£', CAD: 'C$',
    AUD: 'A$', JPY: '¥', CHF: 'CHF ', SEK: 'kr ',
  };
  return map[code?.toUpperCase()] ?? code + ' ';
}
