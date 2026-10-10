
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || false
}));
app.use(express.json({ limit: "100kb" }));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase server configuration.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.replace(/^Bearer\s+/i, "");

    if (!token || token === header) {
      return res.status(401).json({ error: "Sign-in required." });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid session." });
    }

    req.user = data.user;
    next();
  } catch {
    return res.status(401).json({ error: "Authentication failed." });
  }
}

async function membership(req, res, next) {
  try {
    const partnerId = req.params.partnerId || req.body.partner_id;

    if (!partnerId) {
      return res.status(400).json({ error: "partner_id is required." });
    }

    const { data, error } = await supabase
      .from("partner_members")
      .select("role")
      .eq("partner_id", partnerId)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(403).json({ error: "Partner access denied." });
    }

    req.partnerId = partnerId;
    req.role = data.role;
    next();
  } catch {
    return res.status(500).json({ error: "Could not verify partner access." });
  }
}

function requireApprover(req, res, next) {
  if (!["owner", "admin"].includes(req.role)) {
    return res.status(403).json({
      error: "Owner or admin approval permission required."
    });
  }
  next();
}

app.get("/health", (req, res) => {
  res.json({ status: "ok", emailSending: "disabled" });
});

app.get("/api/partners", authenticate, async (req, res) => {
  const { data, error } = await supabase
    .from("partner_members")
    .select("role, partners(id,name,slug,created_at)")
    .eq("user_id", req.user.id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ partners: data || [] });
});

app.post("/api/partners", authenticate, async (req, res) => {
  const name = String(req.body.name || "").trim();
  const slug = String(req.body.slug || "").trim().toLowerCase();

  if (!name || !/^[a-z0-9-]{2,60}$/.test(slug)) {
    return res.status(400).json({
      error: "Provide a name and a slug using letters, numbers, and hyphens."
    });
  }

  const { data: partner, error } = await supabase
    .from("partners")
    .insert({ name, slug })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const { error: memberError } = await supabase
    .from("partner_members")
    .insert({
      partner_id: partner.id,
      user_id: req.user.id,
      role: "owner"
    });

  if (memberError) {
    await supabase.from("partners").delete().eq("id", partner.id);
    return res.status(500).json({ error: "Could not assign owner." });
  }

  res.status(201).json({ partner });
});

app.get(
  "/api/partners/:partnerId/leads",
  authenticate,
  membership,
  async (req, res) => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("partner_id", req.partnerId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ leads: data || [] });
  }
);

app.post(
  "/api/leads",
  authenticate,
  membership,
  async (req, res) => {
    const businessName = String(req.body.business_name || "").trim();

    if (!businessName) {
      return res.status(400).json({ error: "business_name is required." });
    }

    const { data, error } = await supabase
      .from("leads")
      .insert({
        partner_id: req.partnerId,
        business_name: businessName,
        contact_name: req.body.contact_name || null,
        email: req.body.email || null,
        website: req.body.website || null,
        source: req.body.source || null,
        notes: req.body.notes || null
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ lead: data });
  }
);

app.post(
  "/api/assistants",
  authenticate,
  membership,
  requireApprover,
  async (req, res) => {
    const name = String(req.body.name || "").trim();

    if (!name) return res.status(400).json({ error: "name is required." });

    const { data, error } = await supabase
      .from("assistants")
      .insert({
        partner_id: req.partnerId,
        name,
        purpose: req.body.purpose || "lead_generation",
        settings: {}
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ assistant: data });
  }
);

app.post(
  "/api/outreach/drafts",
  authenticate,
  membership,
  async (req, res) => {
    const subject = String(req.body.subject || "").trim();
    const body = String(req.body.body || "").trim();

    if (!subject || !body) {
      return res.status(400).json({
        error: "Both subject and body are required."
      });
    }

    const { data, error } = await supabase
      .from("outreach_drafts")
      .insert({
        partner_id: req.partnerId,
        lead_id: req.body.lead_id || null,
        subject,
        body,
        status: "pending_approval"
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ draft: data, emailSent: false });
  }
);

app.post(
  "/api/outreach/:draftId/approve",
  authenticate,
  async (req, res) => {
    const { data: draft, error } = await supabase
      .from("outreach_drafts")
      .select("id,partner_id,status")
      .eq("id", req.params.draftId)
      .maybeSingle();

    if (error || !draft) {
      return res.status(404).json({ error: "Draft not found." });
    }

    req.body.partner_id = draft.partner_id;

    membership(req, res, async () => {
      if (!["owner", "admin"].includes(req.role)) {
        return res.status(403).json({ error: "Approval permission required." });
      }

      if (draft.status !== "pending_approval") {
        return res.status(409).json({ error: "Draft is not awaiting approval." });
      }

      const { data, error: updateError } = await supabase
        .from("outreach_drafts")
        .update({
          status: "approved",
          approved_by: req.user.id,
          approved_at: new Date().toISOString()
        })
        .eq("id", draft.id)
        .eq("status", "pending_approval")
        .select()
        .maybeSingle();

      if (updateError || !data) {
        return res.status(409).json({ error: "Could not approve this draft." });
      }

      res.json({ draft: data, emailSent: false });
    });
  }
);

app.post("/api/outreach/:draftId/send", authenticate, async (req, res) => {
  return res.status(503).json({
    error: "Email sending is disabled until owner-approved delivery is configured and tested."
  });
});

app.listen(PORT, () => {
  console.log(`ZUNO AI backend listening on port ${PORT}`);
});
