/* Domain Balancing — interactive companion. Vanilla JS, no build step. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

  const INK = "#12181f", BAL = "#2563a8", NAT = "#d98a2b", BG = "#eef1f4";

  // Five-domain balanced vs natural share (%) for the hero signature.
  // Balanced = 20% each; natural ≈ EPM+MB ~95%, three minority ~1-2% each.
  const DOMAINS = ["AMI", "ICSI", "ELITR", "EPM", "MB"];
  const BAL_SHARE = [20, 20, 20, 20, 20];
  const NAT_SHARE = [1.5, 1.4, 2.1, 47, 48];
  const SEG_COLORS = ["#2563a8", "#4f83c4", "#7aa6d8", "#c98a3a", "#e0a866"];

  document.addEventListener("DOMContentLoaded", () => {
    wireMeta();
    renderSignature();
    renderConfound();
    renderStats();
    renderPipeline();
    renderFindings();
    renderCorpora();
    renderUnit();
    renderRq5();
    renderEval();
    renderTakeaways();
    renderCite();
    buildExplorer();
    setupReveal();
  });

  /* ---------- meta / links ---------- */
  function wireMeta() {
    const m = DATA.meta;
    $("#authors").innerHTML = `<b>${m.authors}</b> · ${m.affiliation}`;
    $("#venue").textContent = m.venue;
    $("#arxiv-btn").href = m.arxiv;
    $("#gh-nav").href = m.github;
  }

  /* ---------- hero signature: allocation bars ---------- */
  function renderSignature() {
    const host = $("#alloc-bars");
    const rows = [
      { label: "Balanced", sub: "equal tokens", share: BAL_SHARE },
      { label: "Natural", sub: "native size", share: NAT_SHARE }
    ];
    rows.forEach(r => {
      const row = el("div", "allocrow");
      row.appendChild(el("div", "rl", `${r.label}<small>${r.sub}</small>`));
      const bar = el("div", "bar");
      r.share.forEach((s, i) => {
        const seg = el("div", "seg" + (s < 6 ? " faint" : ""),
          s >= 6 ? `${DOMAINS[i]} ${s}%` : "");
        seg.style.width = s + "%";
        seg.style.background = SEG_COLORS[i];
        seg.title = `${DOMAINS[i]} · ${s}%`;
        bar.appendChild(seg);
      });
      row.appendChild(bar);
      host.appendChild(row);
    });
    const lg = $("#alloc-legend");
    DOMAINS.forEach((d, i) => {
      const role = DATA.corpora[i] ? DATA.corpora[i].role : "";
      lg.appendChild(el("span", null, `<i style="background:${SEG_COLORS[i]}"></i>${d}`));
    });
  }

  /* ---------- confound ---------- */
  function renderConfound() {
    $("#confound-lead").textContent = DATA.confound.lead;
    $("#confound-body").textContent = DATA.confound.body;
  }

  /* ---------- stat band ---------- */
  function renderStats() {
    const g = $("#stat-band");
    DATA.stats.forEach(s => g.appendChild(el("div", "stat reveal",
      `<div class="num">${s.num}</div><div class="lab">${s.lab}</div>`)));
  }

  /* ---------- pipeline ---------- */
  function renderPipeline() {
    const g = $("#pipeline");
    DATA.pipeline.forEach(s => g.appendChild(el("div", "pstage",
      `<div class="pnum">${s.n}</div><h4>${s.name}</h4><p>${s.desc}</p>`)));
  }

  /* ---------- findings ---------- */
  function renderFindings() {
    const g = $("#findings-grid");
    DATA.findings.forEach(f => {
      const wide = f.n === 5 ? " wide" : "";
      g.appendChild(el("div", "finding reveal" + wide,
        `<div class="fn"><span>RQ${f.n}</span><span class="tag">${f.tag}</span></div>
         <h3>${f.rq}</h3>
         <div class="ans">${f.answer}</div>
         <div class="det">${f.detail}</div>`));
    });
  }

  /* ---------- corpora table ---------- */
  function renderCorpora() {
    const tb = $("#corpora-table tbody");
    DATA.corpora.forEach(c => {
      tb.appendChild(el("tr", null,
        `<td><b>${c.name}</b></td>
         <td>${c.domain}</td>
         <td>${c.genre}</td>
         <td><span class="pill ${c.role}">${c.role}</span></td>
         <td>${c.note}</td>`));
    });
  }

  /* ---------- RQ4 unit box ---------- */
  function renderUnit() {
    $("#unit-note").textContent = DATA.exampleLevel.note;
    const box = $("#unit-box");
    DATA.exampleLevel.scores.forEach(s => {
      const dir = s.moves; // "up" or "down"
      const massRow = DATA.exampleLevel.tokenMass.find(t => t.corpus === s.dataset);
      const mass = massRow ? (massRow.tokens / 1000).toFixed(0) + "K tokens" : "";
      box.appendChild(el("div", "ucard " + dir,
        `<div class="uc">${s.dataset} · example-level vs balanced (ROUGE-Lsum)</div>
         <div class="uv">${s.example.toFixed(3)} <span style="color:var(--ink-soft);font-size:1rem">vs ${s.balanced.toFixed(3)}</span></div>
         <div class="um">${massRow ? massRow.kind : ""} — ${mass} at 43 meetings. Moves ${dir === "up" ? "up (over-allocated)" : "down (starved)"} on the same data.</div>`));
    });
  }

  /* ---------- RQ5 replication ---------- */
  function renderRq5() {
    const g = $("#rq5-grid");
    DATA.rq5.forEach(r => {
      const cls = r.role === "minority" ? "pos" : "neg";
      const fmt = v => (v > 0 ? "+" : "") + v.toFixed(3);
      g.appendChild(el("div", "r5",
        `<div class="d">${r.dataset}</div>
         <div class="g ${cls}">${fmt(r.m7b_r)}<small>Mistral-7B · ROUGE</small></div>
         <div class="g ${cls}" style="margin-top:8px">${fmt(r.l3b_r)}<small>Llama-3.2-3B · ROUGE</small></div>`));
    });
  }

  /* ---------- evaluation ---------- */
  function renderEval() {
    const g = $("#metric-grid");
    DATA.evaluation.metrics.forEach(m => {
      const rb = m.kind.includes("Reference-based");
      g.appendChild(el("div", "metric",
        `<span class="mk${rb ? " rb" : ""}">${m.kind}</span><h4>${m.name}</h4><p>${m.what}</p>`));
    });
    $("#agg-note").textContent = DATA.evaluation.aggregation;
    $("#kappa-num").textContent = "κ " + DATA.evaluation.validation.kappa;
    $("#val-caption").textContent = DATA.evaluation.validation.caption;
  }

  /* ---------- takeaways ---------- */
  function renderTakeaways() {
    const p = $("#practitioner"), l = $("#limitations");
    DATA.practitioner.forEach(x => p.appendChild(el("li", null, x)));
    DATA.limitations.forEach(x => l.appendChild(el("li", null, x)));
  }

  /* ---------- cite ---------- */
  function renderCite() {
    const m = DATA.meta;
    const bib =
`@inproceedings{sood2026domainbalancing,
  title     = {Token Distribution versus Data Volume: Domain Balancing
               in Multi-Domain Meeting Summarisation},
  author    = {Sood, Ashima and Gardiner, Bryan and Condell, Joan},
  booktitle = {Proceedings of the 19th International Natural Language
               Generation Conference (INLG)},
  year      = {2026},
  note      = {arXiv:2608.15935}
}`;
    $("#bibtex").textContent = bib;
    const links = [
      { t: "📄 arXiv", u: m.arxiv },
      { t: "🤗 Hugging Face", u: m.hf },
      { t: "💻 Code", u: m.github },
      { t: "✉️ " + m.email, u: "mailto:" + m.email }
    ];
    const host = $("#foot-links");
    links.forEach(x => { const a = el("a", null, x.t); a.href = x.u; a.target = "_blank"; a.rel = "noopener"; host.appendChild(a); });
  }

  /* ---------- interactive budget-ladder explorer ---------- */
  let chart, activeCorpus = "ICSI", activeMetric = "bert";

  const NOTES = {
    ICSI:  "The starkest case. Balanced leads at every budget and the gap never closes — natural gives ICSI 436K tokens at 32M, fewer than the 397K balanced already assigns it at 2M.",
    AMI:   "Balanced leads throughout. The minority advantage is present at the smallest budget and holds as the ladder climbs.",
    ELITR: "The widest ROUGE-Lsum gap of any minority domain — natural stays low and flat, held down by its ~2% proportional share.",
    EPM:   "A majority domain: the schemes run close. Natural leads early on ROUGE-Lsum, but balanced edges ahead by 32M (0.547 vs 0.534).",
    MB:    "The one domain that consistently favours natural — the largest corpus, which proportional allocation feeds most heavily."
  };

  function buildExplorer() {
    const tabs = $("#corpus-tabs");
    ["ICSI", "AMI", "ELITR", "EPM", "MB"].forEach((k, i) => {
      const role = DATA.budgetLadder[k].role;
      const t = el("button", "tab" + (k === activeCorpus ? " active" : ""),
        `${k}<span class="role">${role}</span>`);
      t.onclick = () => { activeCorpus = k; [...tabs.children].forEach(x => x.classList.remove("active")); t.classList.add("active"); drawLadder(); };
      tabs.appendChild(t);
    });
    const tg = $("#metric-toggle");
    [["bert", "BERTScore-F1"], ["rouge", "ROUGE-Lsum"]].forEach(([k, lab], i) => {
      const b = el("button", "mtoggle" + (k === activeMetric ? " active" : ""), lab);
      b.onclick = () => { activeMetric = k; [...tg.children].forEach(x => x.classList.remove("active")); b.classList.add("active"); drawLadder(); };
      tg.appendChild(b);
    });
    drawLadder();
  }

  function drawLadder() {
    const d = DATA.budgetLadder[activeCorpus];
    const bal = activeMetric === "bert" ? d.bal_bert : d.bal_rouge;
    const nat = activeMetric === "bert" ? d.nat_bert : d.nat_rouge;
    $("#ladder-note").textContent = NOTES[activeCorpus];

    const grid = "rgba(238,241,244,.12)", tick = "rgba(238,241,244,.74)";
    const cfg = {
      type: "line",
      data: {
        labels: DATA.budgetTicks,
        datasets: [
          { label: "Balanced", data: bal, borderColor: BAL, backgroundColor: BAL,
            tension: .3, pointRadius: 5, pointHoverRadius: 7, borderWidth: 3, fill: false },
          { label: "Natural", data: nat, borderColor: NAT, backgroundColor: NAT,
            tension: .3, pointRadius: 5, pointHoverRadius: 7, borderWidth: 3, borderDash: [5, 4], fill: false }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: tick, font: { family: "'IBM Plex Mono', monospace", size: 11 }, usePointStyle: true } },
          tooltip: { backgroundColor: INK, titleColor: BG, bodyColor: BG, borderColor: NAT, borderWidth: 1, padding: 10 }
        },
        scales: {
          x: { grid: { color: grid }, ticks: { color: tick, font: { family: "'IBM Plex Mono', monospace" } },
               title: { display: true, text: "Token budget", color: tick, font: { size: 11 } } },
          y: { grid: { color: grid }, ticks: { color: tick, font: { family: "'IBM Plex Mono', monospace" } },
               title: { display: true, text: activeMetric === "bert" ? "BERTScore-F1" : "ROUGE-Lsum", color: tick, font: { size: 11 } } }
        }
      }
    };
    if (chart) chart.destroy();
    chart = new Chart($("#ladderChart"), cfg);
  }

  /* ---------- scroll reveal ---------- */
  function setupReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12 });
    document.querySelectorAll(".reveal").forEach(n => io.observe(n));
  }
})();
