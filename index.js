const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const SHOP = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_TOKEN;
const VERSION = process.env.API_VERSION || "2024-04";

app.get("/create", async (req, res) => {
  const discount = parseInt(req.query.discount || "10");
  if (![5, 10, 15, 20, 25, 30].includes(discount)) {
    return res.status(400).json({ error: "Ungültiger Rabatt" });
  }

  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + 30);

  const rule = await fetch(`https://${SHOP}/admin/api/${VERSION}/price_rules.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      price_rule: {
        title: `Game-${Date.now()}`,
        target_type: "line_item",
        target_selection: "all",
        allocation_method: "across",
        value_type: "percentage",
        value: `-${discount}`,
        customer_selection: "all",
        starts_at: now.toISOString(),
        ends_at: end.toISOString(),
        usage_limit: 1,
        once_per_customer: true
      }
    })
  });

  const ruleData = await rule.json();
  const ruleId = ruleData.price_rule.id;

  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const code = `LOGIX-${discount}-${suffix}`;

  const codeRes = await fetch(`https://${SHOP}/admin/api/${VERSION}/price_rules/${ruleId}/discount_codes.json`, {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ discount_code: { code } })
  });

  const codeData = await codeRes.json();
  res.json({ code: codeData.discount_code.code, valid_until: end.toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Läuft auf Port " + PORT));
