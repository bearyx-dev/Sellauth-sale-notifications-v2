# SellAuth Shopify style Sale Notifications v2

Create **Shopify style sale notifications** for your SellAuth store and receive them instantly on your phone.

**Built by [UXModz](https://discord.gg/em5ZU3QfBB)** | [Join Us!](https://discord.gg/em5ZU3QfBB)

This project uses:

* SellAuth
* Pushover
* **Cloudflare Workers** *(replaces Pipedream free, faster, simpler)*

Example notification:

```
€29.99, 3 products from Online Store
• UXModz
```

Is it free? **YES!**
> Cloudflare Workers gives you **100,000 free requests per day** no sign-up credit card, no limits for any normal store.

> Pushover offers a 30-day trial and then costs about $6 as a one-time purchase per device (no subscription) so for your phone it would only cost $6 once :).

---

# Why Cloudflare Workers?

| | Pipedream (v1) | Cloudflare Workers (v2) |
|---|---|---|
| Free requests/day | ~333 | **100,000** |
| Setup time | 15–20 min | **~5 min** |
| Complexity | High (step names must match exactly) | Paste one file, done |
| Cost | Free → paid | **Free forever** |

---

# What This Does

1. Customer completes a purchase in SellAuth
2. SellAuth sends a webhook notification
3. **Cloudflare Worker** receives the webhook
4. Worker fetches invoice details from SellAuth API
5. Worker sends a push notification via Pushover

Result: **Instant Shopify-style sale notification on your phone.**

---

# 1) What You Need First

Before starting, make sure you have:

• A SellAuth account  
• A Pushover account  
• A **free** Cloudflare account  
• Your SellAuth **API key**  
• Your SellAuth **Shop ID**  

---

# 2) Setup Pushover

Install the **Pushover app** on your phone and create an account.

Go to:

```
https://pushover.net/apps/build
```

Create a new application.

Example settings:

```
Name: SellAuth Notifications
```

---

# 3) Add a Custom Icon

Inside your Pushover application settings, upload an icon.

Recommended:

• SellAuth logo styled with Shopify colors looks the best  
[SellAuth Shopify Logo](assets/logo/sellauth-shopify.png)

This gives notifications a **clean Shopify style appearance**.

After creating the application, copy:

```
API Token / Key
```

Also copy your:

```
User Key
```

You need both later.

---

# 4) Add a Custom Sound

Open the **Pushover app on your phone** (not the website).

Go to **Settings → Sounds → Custom Sounds → Add Sound**

Upload the sound file from this repo: [shopify-notification.mp3](assets/sound/shopify-notification.mp3)

**How to download the MP3 on your phone:**

1. Open the link above on your phone
2. Tap the **three dots** (top right)
3. Tap the **share icon**
4. Tap **Save to Files**
5. Save it then you can upload it inside the Pushover app

Name the sound exactly:

```
shopify
```

---

# 5) Create a Cloudflare Worker

Go to:

```
https://workers.cloudflare.com
```

Sign up for free, then:

1. Click **Workers & Pages** in the left sidebar
2. Click **Create**
3. Click **Hello World** (this creates a Worker — ignore the other options)
4. Give it a name example: `sellauth-notifications`
5. Click **Deploy**
6. Click **Edit code**
7. Delete everything in the editor and paste the full contents of [`worker.js`](worker.js) from this repo
8. Click **Deploy** again

Your Worker now has a URL like:

```
https://sellauth-notifications.yourname.workers.dev
```

---

# 6) Add Your Environment Variables

In your Worker dashboard:

**Settings** → **Variables and Secrets** → **Add**

| Variable | Value |
|---|---|
| `SELLAUTH_API_KEY` | Your SellAuth API key |
| `SELLAUTH_SHOP_ID` | Your SellAuth shop ID |
| `PUSHOVER_TOKEN` | Your Pushover app token |
| `PUSHOVER_USER` | Your Pushover user key |
| `SHOP_NAME` | Your store name (shown in notifications) |

> Set the type to **Secret** on each one to keep your keys safe.

---

# 7) Connect SellAuth Webhook

Open your SellAuth dashboard.

Navigate to:

```
Settings → Notifications
```

Enable **HTTP notifications** and paste your Worker URL:

```
https://sellauth-notifications.yourname.workers.dev
```

Save.

---

# You're Done!

That's everything. To test it, either:

- Create a **$0 product** in SellAuth and place a test order you'll get the notification with a delay of 30sec–1min which is normal (Pipedream used to take like 3min)
- Or just wait for your next real purchase, you won't even notice the delay anyway

---

# Optional: Test Endpoint

You can also trigger a fake notification any time by opening this in your browser:

```
https://sellauth-notifications.yourname.workers.dev/test
```

You'll see **"✅ Test notification sent!"** and get a fake sale notification on your phone immediately.

---

# Optional: Customize Your Notification

The default message is already set up and working. But if you want to change what shows up, edit the `message` line in `worker.js`.

Here are all the fields available from the SellAuth invoice:

| Field | What it is | Example |
|---|---|---|
| `invoice.total` | Total amount paid | `29.99` |
| `invoice.currency` | Currency code | `EUR`, `USD`, `GBP` |
| `invoice.email` | Buyer email | `buyer@email.com` |
| `invoice.country_code` | Buyer country | `DE`, `US`, `GB` |
| `invoice.gateway` | Payment method | `card`, `crypto`, `paypal` |
| `invoice.status` | Invoice status | `processed`, `confirming` |
| `invoice.created_at` | When the order was placed | timestamp |
| `invoice.items` | Array of line items (each has `name`, `quantity`, `price`) | — |
| `invoice.coupon_code` | Coupon used (if any) | `SAVE10` |
| `invoice.affiliate_id` | Affiliate ID (if referred) | — |

### Example: add buyer country

```js
const country = invoice.country_code ?? '';
const message = `${symbol}${amount}, ${productLine} from Online Store\n• ${shopName}${country ? `\n• ${country}` : ''}`;
```

### Example: show payment method

```js
const gateway = invoice.gateway ?? '';
const message = `${symbol}${amount}, ${productLine} from Online Store\n• ${shopName}${gateway ? `\n• ${gateway}` : ''}`;
```

### Example: show buyer email

```js
const message = `${symbol}${amount}, ${productLine} from Online Store\n• ${shopName}\n• ${invoice.email}`;
```

---

# Need Help?

Join the UXModz Discord — we'll get you set up :}  
https://discord.gg/em5ZU3QfBB
