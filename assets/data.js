// Domain Balancing — data extracted from the paper (Sood, Gardiner, Condell; INLG 2026)
// Token Distribution versus Data Volume: Domain Balancing in Multi-Domain Meeting Summarisation.
// All values are from the published tables/figures. One file, zero build step.

const DATA = {

  // ---- Five corpora (Section 4.1, Table 15 scale ordering) ----
  // "role" drives the balanced/minority vs majority colour coding.
  corpora: [
    { name: "AMI",   domain: "Project meetings",        genre: "Scenario-driven design", role: "minority", note: "Data-scarce; gains most from balancing" },
    { name: "ICSI",  domain: "Academic meetings",       genre: "Research discussions",    role: "minority", note: "Smallest corpus; sets the balancing cap" },
    { name: "ELITR", domain: "Technical project",       genre: "Minuting corpus",         role: "minority", note: "Multiple references per meeting" },
    { name: "EPM",   domain: "Parliamentary",           genre: "EuroParl debate",         role: "majority", note: "Majority corpus; near-even under both schemes" },
    { name: "MB",    domain: "Municipal proceedings",   genre: "MeetingBank (ASR)",       role: "majority", note: "Largest corpus; favours natural" }
  ],

  // ---- The five research questions and their headline answers ----
  findings: [
    { n: 1, tag: "Distribution",
      rq: "Does domain-balanced allocation change quality, independent of volume?",
      answer: "Balancing redistributes quality — it does not add it.",
      detail: "At a matched 32M budget, balancing leads every data-scarce domain on both metrics (ROUGE-Lsum: AMI +0.102, ICSI +0.164, ELITR +0.163) while costing the majority domains a little (MB −0.046, EPM near-even). The macro average favours balanced, the micro average favours natural — the same split, read two ways." },
    { n: 2, tag: "Token efficiency",
      rq: "Does quality scale with budget, and is balancing worth more when small?",
      answer: "The minority gap stays open across the whole 2→32M ladder.",
      detail: "Proportional allocation pins the scarce domains at a 1–2% share at every budget. Natural gives ICSI 436K tokens at 32M — fewer than the 397K balanced already assigns it at 2M — so natural must spend an order of magnitude more budget to buy the same exposure, and still trails at 32M." },
    { n: 3, tag: "Pruning",
      rq: "Can low-value transcript lines be removed without losing quality?",
      answer: "Pruning cuts 6.8% of tokens at no measurable cost.",
      detail: "Removing conversational filler leaves BERTScore-F1 near-identical across the ladder and converges on ROUGE-Lsum by 32M. Pruned transcripts are 7–16% shorter, so a fixed budget spans 8–19% more meetings — most useful exactly where balancing oversamples the minority corpora hardest (up to 11× for ICSI)." },
    { n: 4, tag: "Unit of balancing",
      rq: "Is balancing by token count different from balancing by example count?",
      answer: "Tokens, not examples, are the unit that matters.",
      detail: "Equal meeting counts (43 per corpus) hand ICSI ~578K tokens but MB only ~137K — a ~4× gap. Per-domain quality follows the tokens, moving ICSI and MB in opposite directions on the same data. Balancing on examples allocates by accident; balancing on tokens allocates by design." },
    { n: 5, tag: "Model scale",
      rq: "Do the findings hold on a smaller model from another family?",
      answer: "The redistribution replicates on Llama-3.2-3B.",
      detail: "The balanced−natural gap keeps its sign on every dataset and both metrics — positive on the three minority domains, negative on the two majority domains. Absolute quality is lower, so what transfers is the direction of the effect, not its magnitude, indicating it comes from the data allocation rather than from Mistral-7B." }
  ],

  // ---- Pipeline (Figure 1) ----
  pipeline: [
    { n: "A", name: "Prune", desc: "Strip conversational filler from transcripts with Gemma-3-27B-it, a KEEP/DELETE line-retention pass. Removes 6.8% of training tokens, validated by a two-annotator study." },
    { n: "B", name: "Allocate", desc: "Build training mixtures under three schemes — balanced (equal tokens per corpus), natural (native proportions), and example-level — at a fixed token budget from 2M to 32M." },
    { n: "C", name: "Select", desc: "Screen six candidate LLMs zero-shot; Mistral-7B-Instruct-v0.3 wins on BERTScore-F1. Keep Llama-3.2-3B as a scaling control for RQ5." },
    { n: "D", name: "Fine-tune", desc: "Fine-tune Mistral-7B with QLoRA (4-bit, rank 32) under identical hyperparameters across every scheme, budget, and condition." },
    { n: "E", name: "Evaluate", desc: "Score generated minutes per domain with automatic metrics and a fact-level LLM judge (Qwen2.5-72B), aggregating both macro and micro." }
  ],

  // ---- The core confound the paper untangles ----
  confound: {
    lead: "When a balanced mixture helps, is the gain from the distribution of tokens across domains, or merely from the volume of data seen?",
    body: "Giving data-scarce domains a larger share within a fixed budget reallocates tokens away from data-rich domains; granting scarce domains more data outright instead changes the total volume. The two usually move together. This study separates them: it holds volume fixed and varies only the distribution, by building balanced and natural mixtures at matched token budgets."
  },

  // ---- Stat band ----
  stats: [
    { num: "5", lab: "English meeting corpora, spanning 2+ orders of magnitude in scale" },
    { num: "2–32M", lab: "Matched token-budget ladder" },
    { num: "3", lab: "Allocation schemes — balanced, natural, example-level" },
    { num: "741", lab: "Judge-labelled facts validated by two annotators" }
  ],

  // ---- Token allocation for ICSI across the budget ladder (Table 1) ----
  // Shows the balanced-vs-natural asymmetry that drives RQ2.
  icsiAllocation: [
    { budget: "2M",  balanced: 397000, natural: 27000  },
    { budget: "4M",  balanced: 794000, natural: 54000  },
    { budget: "8M",  balanced: 1600000, natural: 108000 },
    { budget: "16M", balanced: 3200000, natural: 215000 },
    { budget: "32M", balanced: 6400000, natural: 436000 }
  ],

  // ---- RQ1: balanced vs natural per domain at 32M (Table 2) ----
  rq1_32M: {
    rougeLsum: {
      balanced: { AMI: 0.495, ICSI: 0.445, ELITR: 0.367, EPM: 0.547, MB: 0.648, Macro: 0.500, Micro: 0.615 },
      natural:  { AMI: 0.393, ICSI: 0.281, ELITR: 0.204, EPM: 0.534, MB: 0.694, Macro: 0.421, Micro: 0.637 }
    },
    bertF1: {
      balanced: { AMI: 0.875, ICSI: 0.852, ELITR: 0.846, EPM: 0.887, MB: 0.928, Macro: 0.877, Micro: 0.915 },
      natural:  { AMI: 0.865, ICSI: 0.833, ELITR: 0.837, EPM: 0.889, MB: 0.938, Macro: 0.872, Micro: 0.923 }
    }
  },

  // ---- RQ2: per-dataset quality across the budget ladder (Figure 2) ----
  // BERTScore-F1, balanced vs natural, for the interactive explorer.
  // Minority panels show the persistent gap; majority panels near-even.
  budgetLadder: {
    AMI: {
      role: "minority",
      bal_bert:  [0.836, 0.851, 0.860, 0.869, 0.875], nat_bert:  [0.826, 0.840, 0.851, 0.859, 0.865],
      bal_rouge: [0.372, 0.418, 0.451, 0.478, 0.495], nat_rouge: [0.318, 0.340, 0.362, 0.379, 0.393]
    },
    ICSI: {
      role: "minority",
      bal_bert:  [0.826, 0.838, 0.844, 0.849, 0.852], nat_bert:  [0.816, 0.822, 0.827, 0.830, 0.833],
      bal_rouge: [0.360, 0.395, 0.418, 0.434, 0.445], nat_rouge: [0.243, 0.256, 0.267, 0.275, 0.281]
    },
    ELITR: {
      role: "minority",
      bal_bert:  [0.824, 0.833, 0.839, 0.843, 0.846], nat_bert:  [0.820, 0.826, 0.831, 0.834, 0.837],
      bal_rouge: [0.300, 0.330, 0.348, 0.360, 0.367], nat_rouge: [0.170, 0.185, 0.194, 0.200, 0.204]
    },
    EPM: {
      role: "majority",
      bal_bert:  [0.870, 0.878, 0.882, 0.885, 0.887], nat_bert:  [0.872, 0.880, 0.884, 0.887, 0.889],
      bal_rouge: [0.500, 0.520, 0.532, 0.540, 0.547], nat_rouge: [0.520, 0.528, 0.531, 0.533, 0.534]
    },
    MB: {
      role: "majority",
      bal_bert:  [0.912, 0.919, 0.923, 0.926, 0.928], nat_bert:  [0.922, 0.930, 0.934, 0.936, 0.938],
      bal_rouge: [0.612, 0.628, 0.638, 0.644, 0.648], nat_rouge: [0.658, 0.672, 0.682, 0.689, 0.694]
    }
  },
  budgetTicks: ["2M", "4M", "8M", "16M", "32M"],

  // ---- RQ4: example-level allocation, token mass per corpus (Table 4 context) ----
  exampleLevel: {
    note: "Example-level balancing gives every corpus 43 meetings. Because transcripts differ in length, equal meeting counts turn into very unequal token mass — the opposite of what token-balancing enforces.",
    tokenMass: [
      { corpus: "ICSI", tokens: 578000, kind: "Long transcripts → over-allocated" },
      { corpus: "MB",   tokens: 137000, kind: "Short transcripts → starved of tokens" }
    ],
    scores: [
      { dataset: "MB",   example: 0.505, balanced: 0.562, seedStd: 0.008, moves: "down" },
      { dataset: "ICSI", example: 0.292, balanced: 0.258, seedStd: 0.036, moves: "up" }
    ]
  },

  // ---- RQ5: balanced−natural gap, Mistral-7B vs Llama-3.2-3B (Table 5) ----
  rq5: [
    { dataset: "AMI",   role: "minority", m7b_r: +0.122, l3b_r: +0.155, m7b_b: +0.018, l3b_b: +0.034 },
    { dataset: "ICSI",  role: "minority", m7b_r: +0.202, l3b_r: +0.141, m7b_b: +0.027, l3b_b: +0.040 },
    { dataset: "ELITR", role: "minority", m7b_r: +0.089, l3b_r: +0.072, m7b_b: +0.010, l3b_b: +0.032 },
    { dataset: "EPM",   role: "majority", m7b_r: -0.039, l3b_r: -0.178, m7b_b: -0.006, l3b_b: -0.031 },
    { dataset: "MB",    role: "majority", m7b_r: -0.039, l3b_r: -0.061, m7b_b: -0.007, l3b_b: -0.014 }
  ],

  // ---- Evaluation protocol (Section 3.6) ----
  evaluation: {
    metrics: [
      { name: "ROUGE-1/2/L/Lsum", kind: "Automatic", what: "Lexical n-gram and longest-common-subsequence overlap with the reference minute." },
      { name: "BERTScore-F1", kind: "Automatic", what: "Embedding similarity to the reference — tracks semantic adequacy more closely than surface overlap. The primary selection metric." },
      { name: "Fact-level LLM judge", kind: "Reference-based", what: "Decomposes each minute into atomic facts and scores completeness, faithfulness, and conciseness. Judge is Qwen2.5-72B, a different family from the summariser to avoid self-preference." }
    ],
    aggregation: "Every result is read per domain. The macro average weights the five domains equally; the micro average weights every meeting equally. Because MB and EPM hold 94% of test meetings, micro is majority-dominated while macro surfaces the data-scarce domains — the two disagree by construction.",
    validation: {
      kappa: "0.79–0.84",
      caption: "Two annotators re-labelled 741 of the judge's per-fact decisions on the balanced-32M system. Inter-annotator agreement was substantial on all three dimensions (Cohen's κ). The judge reaches the human band on completeness and sits just below it on faithfulness and conciseness; its errors are one-sided, so its absolute scores read as upper bounds."
    }
  },

  // ---- Limitations & takeaways (Conclusion) ----
  practitioner: [
    "Retain the native distribution when the deployment is majority-weighted.",
    "Balance when all domains must be served — including the data-scarce ones.",
    "Balance by tokens, not by examples: equal meeting counts allocate by accident.",
    "Prune conversational filler before training, in either case — it is free."
  ],
  limitations: [
    "The fact-level judge's absolute scores are upper bounds: its errors are one-sided (over-accepting), though the balanced-vs-natural and 2M-vs-32M comparisons are unaffected.",
    "Experiments are English-only across five corpora; generalisation to multilingual or code-switched meetings is untested.",
    "Inputs are truncated to a 16K-token window; the small share of longer references (chiefly EuroParlMin) is affected at training time."
  ],

  // ---- Meta ----
  meta: {
    title: "Token Distribution versus Data Volume",
    subtitle: "Domain Balancing in Multi-Domain Meeting Summarisation",
    authors: "Ashima Sood, Bryan Gardiner, Joan Condell",
    affiliation: "School of Computing, Engineering & Intelligent Systems, Ulster University",
    venue: "INLG 2026",
    arxiv: "https://arxiv.org/abs/2608.15935",
    hf: "https://huggingface.co/soodashima91/meeting-summarization-domain-balancing",
    github: "https://soodashima91.github.io/Meet-domain-balancing/",
    email: "sood-a1@ulster.ac.uk"
  }
};
