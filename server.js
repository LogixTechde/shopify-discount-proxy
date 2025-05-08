const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const SHOP = process.env.SHOP_DOMAIN;
const TOKEN = process.env.SHOPIFY_TOKEN;
const API_VERSION = "2024-01";

const MINIMUMS = {
  5: 0,
  10: 75,
  15: 100,
  20: 100,
  25: 100,
  30: 100
};

function generateCode(rabatt) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `RABATT${rabatt}-${random}`;
}

app.get("/", (req, res) => {
  res.send("LogixTech Code Generator läuft!");
});

app.post("/generate-code", async (req, res) => {
  const { email, rabatt } = req.body;
  if (!email || !rabatt) {
    return res.status(400).json({ error: "Email und Rabatt erforderlich" });
  }

  const code = generateCode(rabatt);
  const minSubtotal = MINIMUMS[rabatt] || 0;

  try {
    const priceRuleRes = await axios.post(
      `https://${SHOP}/admin/api/${API_VERSION}/price_rules.json`,
      {
        price_rule: {
          title: code,
          target_type: "line_item",
          target_selection: "all",
          allocation_method: "across",
          value_type: "percentage",
          value: `-${rabatt}`,
          customer_selection: "prerequisite",
          prerequisite_subtotal_range: {
            greater_than_or_equal_to: minSubtotal
          },
          starts_at: new Date().toISOString(),
          usage_limit: 1,
          prerequisite_customer_email: email
        }
      },
      {
        headers: {
          "X-Shopify-Access-Token": TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    const ruleId = priceRuleRes.data.price_rule.id;

    await axios.post(
      `https://${SHOP}/admin/api/${API_VERSION}/price_rules/${ruleId}/discount_codes.json`,
      {
        discount_code: { code }
      },
      {
        headers: {
          "X-Shopify-Access-Token": TOKEN,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ code });
  } catch (error) {
    console.error("Fehler:", error.response?.data || error.message);
    res.status(500).json({ error: "Fehler beim Erstellen des Gutscheins" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App läuft auf Port ${PORT}`);
});
