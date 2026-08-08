# SellAuth Shopify style Sale Notifications v2

Create **Shopify style sale notifications** for your SellAuth store and receive them instantly on your phone.

**Built by [UXModz](https://discord.gg/em5ZU3QfBB)** | [Join Us!](https://discord.gg/em5ZU3QfBB)

This project uses:

* SellAuth
* Pushover
* **Cloudflare Workers** *(replaces Pipedream free, faster, simpler)*

Example notification:

```
€29.99, 1 product from Online Store
• UXModz
```

Is it free? **YES!**
> Cloudflare Workers gives you **100,000 free requests per day** no sign-up credit card, no limits for any normal store.

> Pushover offers a 30-day trial and then costs about $6 as a one-time purchase per device (no subscription) so for your phone it would only cost $6 once :).

---


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

Upload a custom notification sound inside your Pushover application settings.

Name it exactly:

```
shopify
```

You can use the Shopify notification sound included in this repo:  
[shopify-notification.mp3](assets/sound/shopify-notification.mp3)

---

# 5) Create a Cloudflare Worker

Go to:

```
https://workers.cloudflare.com
```

Sign up for free, then:

1. Click **Workers & Pages** → **Create** → **Create Worker**
2. Give it a name — example: `sellauth-notifications`
3. Click **Deploy**
4. Click **Edit code**
5. Delete everything in the editor and paste the full contents of [`worker.js`](worker.js) from this repo
6. Click **Deploy** again

Your Worker now has a URL like:

```
https://sellauth-notifications.yourname.workers.dev
```

---

# 6) Add Your Environment Variables

In your Worker dashboard:

**Settings** → **Variables** → **Add variable**

| Variable | Value |
|---|---|
| `SELLAUTH_API_KEY` | Your SellAuth API key |
| `SELLAUTH_SHOP_ID` | Your SellAuth shop ID |
| `PUSHOVER_TOKEN` | Your Pushover app token |
| `PUSHOVER_USER` | Your Pushover user key |
| `SHOP_NAME` | Your store name (shown in notifications) |

> Click **Encrypt** on every variable to keep your keys safe.

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

Save. That's it — **you're done.**

---

# Notification Format

Every sale sends a notification like this:

```
€29.99, 1 product from Online Store
• UXModz
• DE
• card
```

- Amount + currency symbol auto-detected (€, $, £, etc.)
- Shows number of products in the order
- Shows buyer country code
- Shows payment method

---

# Important

There are **no step names to match**, no variables to template, no Pipedream UI to navigate. The Worker handles everything automatically from the raw SellAuth webhook.

---

# Need Help?

Join the UXModz Discord — we'll get you set up :}  
https://discord.gg/em5ZU3QfBB
