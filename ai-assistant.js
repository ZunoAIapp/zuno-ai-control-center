/* ZUNO AI — Outreach Center v1
   Local draft storage only. No emails are sent.
*/
(() => {
  "use strict";

  const STORE = "zuno-outreach-v1";
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[c]));

  const load = () => {
    try { return JSON.parse(localStorage.getItem(STORE)) || []; }
    catch { return []; }
  };
  const save = data => localStorage.setItem(STORE, JSON.stringify(data));
  let drafts = load();
  let view = "outreach";

  const css = document.createElement("style");
  css.textContent = `
    #zuno-launch{position:fixed;right:16px;bottom:90px;z-index:99999;
      border:0;border-radius:30px;padding:15px 19px;color:white;
      background:linear-gradient(120deg,#087cff,#7546ff);
      font-weight:800;font-size:15px;box-shadow:0 5px 24px #0006}
    #zuno-panel{position:fixed;z-index:99998;right:12px;bottom:150px;
      width:min(440px,calc(100vw - 24px));max-height:72vh;overflow:auto;
      display:none;background:#091322;color:#edf4ff;border:1px solid #263b59;
      border-radius:18px;padding:17px;box-shadow:0 10px 40px #0009;
      font:15px/1.5 system-ui,sans-serif}
    #zuno-panel *{box-sizing:border-box}
    #zuno-panel h2{font-size:22px;margin:0 0 8px}
    #zuno-panel h3{font-size:17px;margin:16px 0 8px}
    #zuno-panel p{color:#afc1d9}
    #zuno-panel label{display:block;margin:10px 0 4px;font-weight:650}
    #zuno-panel input,#zuno-panel select,#zuno-panel textarea{
      width:100%;padding:11px;border-radius:9px;border:1px solid #304663;
      background:#101e31;color:#fff;font:inherit}
    #zuno-panel textarea{min-height:95px;resize:vertical}
    #zuno-panel button{cursor:pointer;border:1px solid #304663;
      border-radius:9px;padding:10px 12px;background:#142640;color:white;
      font:inherit;font-weight:700;margin:4px 4px 4px 0}
    #zuno-panel button.primary{background:#176cff;border-color:#176cff}
    #zuno-panel .zuno-tabs{display:flex;flex-wrap:wrap;margin:10px 0}
    #zuno-panel .zuno-card{border:1px solid #30415a;border-radius:12px;
      padding:12px;margin:10px 0;background:#0e1b2d;overflow-wrap:anywhere}
    #zuno-panel .zuno-status{color:#8ed8b0;font-weight:700}
    #zuno-panel .zuno-note{border:1px solid #715526;background:#2a2112;
      color:#ffdf9a;padding:10px;border-radius:10px;font-size:13px}
    #zuno-panel .zuno-close{float:right}
  `;
  document.head.appendChild(css);

  const launch = document.createElement("button");
  launch.id = "zuno-launch";
  launch.textContent = "✦ ZUNO AI";
  launch.setAttribute("aria-label", "Open ZUNO AI assistant");
  document.body.appendChild(launch);

  const panel = document.createElement("section");
  panel.id = "zuno-panel";
  panel.setAttribute("aria-label", "ZUNO AI Outreach Center");
  document.body.appendChild(panel);

  function tabs() {
    return `<div class="zuno-tabs">
      <button data-view="help">AI Help</button>
      <button data-view="outreach">Create Outreach</button>
      <button data-view="queue">Approval Queue (${drafts.filter(d => d.status === "Pending").length})</button>
      <button class="zuno-close" data-action="close">✕</button>
    </div>`;
  }

  function outreachForm() {
    return `<h2>Build your customer base</h2>
      <p>Prepare personalized sales emails for either of your businesses.</p>
      <div class="zuno-note">Drafts stay on this device. Nothing is emailed automatically.
      Approval here records your approval only; live sending is not connected.</div>
      <form id="zuno-form">
        <label>Business</label>
        <select name="business">
          <option>Barber Land Clearing</option>
          <option>ZUNO AI</option>
        </select>
        <label>Target market</label>
        <select name="market">
          <option>Local / small business</option>
          <option>Major brand / corporation</option>
          <option>Property manager</option>
          <option>Contractor / commercial partner</option>
        </select>
        <label>Company name *</label>
        <input name="company" required placeholder="Company or business name">
        <label>Contact name (if known)</label>
        <input name="contact" placeholder="Contact person">
        <label>Business email *</label>
        <input name="email" type="email" required placeholder="name@company.com">
        <label>What are you offering?</label>
        <textarea name="offer" required placeholder="Describe your service or product"></textarea>
        <label>Why might this company need it?</label>
        <textarea name="reason" placeholder="Use a relevant, verified reason. Do not guess."></textarea>
        <label>Next step to request</label>
        <select name="ask">
          <option>A brief introductory conversation</option>
          <option>A quote or estimate</option>
          <option>A product demonstration</option>
          <option>Information about vendor registration</option>
        </select>
        <button class="primary" type="submit">Prepare email draft</button>
      </form>`;
  }

  function helpPage() {
    return `<h2>Your ZUNO AI assistant</h2>
      <p>I can guide you through this app and help organize customer acquisition.</p>
      <div class="zuno-card"><b>Finding customers</b><p>Add businesses you want to approach. Research legitimate business contact channels before outreach.</p></div>
      <div class="zuno-card"><b>Writing emails</b><p>Create an individual draft, review its accuracy, then place it in your approval queue.</p></div>
      <div class="zuno-card"><b>Following up</b><p>Use your queue to see which drafts are pending or approved. Follow-up scheduling and automatic sending require a backend.</p></div>
      <div class="zuno-card"><b>Protecting your business</b><p>Never upload API secrets here. Use appropriate business contacts, honor opt-outs, and comply with applicable email laws.</p></div>`;
  }

  function queuePage() {
    if (!drafts.length) return `<h2>Outreach approval queue</h2>
      <p>No drafts yet. Create an outreach email to get started.</p>`;
    return `<h2>Outreach approval queue</h2>
      <p>Review every recipient and message before approving it.</p>
      ${drafts.slice().reverse().map(d => `<div class="zuno-card">
        <b>${esc(d.company)}</b>
        <div>${esc(d.business)} · ${esc(d.market)}</div>
        <div>${esc(d.email)}</div>
        <p class="zuno-status">Status: ${esc(d.status)}</p>
        <details><summary>Review full email</summary>
          <p><b>Subject:</b> ${esc(d.subject)}</p>
          <pre style="white-space:pre-wrap;font:inherit">${esc(d.body)}</pre>
        </details>
        ${d.status === "Pending" ? `<button class="primary" data-action="approve" data-id="${esc(d.id)}">Approve draft</button>` : ""}
        <button data-action="export-one" data-id="${esc(d.id)}">Export draft</button>
        <button data-action="delete" data-id="${esc(d.id)}">Delete</button>
      </div>`).join("")}
      <button data-action="export-all">Export all drafts (JSON)</button>`;
  }

  function render() {
    const body = view === "help" ? helpPage()
      : view === "queue" ? queuePage() : outreachForm();
    panel.innerHTML = `<div><b style="letter-spacing:2px">ZUNO AI</b>
      <span style="color:#9bb1ce"> · OUTREACH</span></div>${tabs()}${body}`;
  }

  function makeDraft(f) {
    const business = f.get("business");
    const company = f.get("company").trim();
    const contact = f.get("contact").trim();
    const offer = f.get("offer").trim();
    const reason = f.get("reason").trim();
    const ask = f.get("ask");
    const greeting = contact ? `Hello ${contact},` : `Hello ${company} team,`;
    const subject = business === "Barber Land Clearing"
      ? `Land clearing services inquiry — ${company}`
      : `Introduction to ZUNO AI — ${company}`;

    const body = `${greeting}

I'm reaching out on behalf of ${business}.

${reason ? reason + "\n\n" : ""}${offer}

Would you be open to ${ask.toLowerCase()}?

If this isn't relevant to your role, please feel free to let me know. If you prefer not to receive further outreach, let us know and we will respect that request.

Thank you,
${business}`;

    return { subject, body };
  }

  launch.addEventListener("click", () => {
    panel.style.display = panel.style.display === "block" ? "none" : "block";
    render();
  });

  panel.addEventListener("submit", event => {
    if (event.target.id !== "zuno-form") return;
    event.preventDefault();
    const f = new FormData(event.target);
    const company = String(f.get("company") || "").trim();
    const email = String(f.get("email") || "").trim();
    const offer = String(f.get("offer") || "").trim();
    if (!company || !email || !offer) {
      alert("Please complete the company, email, and offer fields.");
      return;
    }
    const mail = makeDraft(f);
    drafts.push({
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
      business: f.get("business"),
      market: f.get("market"),
      company, contact: f.get("contact"), email,
      offer, reason: f.get("reason"),
      subject: mail.subject, body: mail.body,
      status: "Pending", createdAt: new Date().toISOString()
    });
    save(drafts);
    view = "queue";
    render();
  });

  panel.addEventListener("click", event => {
    const b = event.target.closest("button");
    if (!b) return;
    if (b.dataset.view) { view = b.dataset.view; render(); return; }
    const id = b.dataset.id;
    if (b.dataset.action === "close") { panel.style.display = "none"; return; }

    if (b.dataset.action === "approve") {
      const d = drafts.find(x => x.id === id);
      if (d && confirm(`Approve the draft for ${d.company}? This does NOT send an email.`)) {
        d.status = "Approved — not sent";
        d.approvedAt = new Date().toISOString();
        save(drafts);
        render(); 
      }
    }
    if (b.dataset.action === "delete" && confirm("Delete this saved draft?")) {
      drafts = drafts.filter(x => x.id !== id);
      save(drafts); render();
    }
    if (b.dataset.action === "export-one") {
      const d = drafts.find(x => x.id === id);
      if (d) download(`zuno-draft-${id}.json`, JSON.stringify(d, null, 2));
    }
    if (b.dataset.action === "export-all") {
      download("zuno-outreach-drafts.json", JSON.stringify(drafts, null, 2));
    }
  });

  function download(name, contents) {
    const url = URL.createObjectURL(new Blob([contents], {type:"application/json"}));
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  render();
})();
