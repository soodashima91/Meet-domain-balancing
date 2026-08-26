# Domain Balancing

**Token Distribution versus Data Volume: Domain Balancing in Multi-Domain Meeting Summarisation.**

Sood, A., Gardiner, B., & Condell, J. (2026). *Proceedings of the 19th International Natural Language Generation Conference (INLG).*

📄 **[Read on arXiv](https://arxiv.org/abs/2608.15935)** · 🤗 **[Hugging Face](https://huggingface.co/soodashima91/meeting-summarization-domain-balancing)** · 🌐 **[Interactive companion site](https://soodashima91.github.io/domain-balancing/)**

---

## What this is

An interactive companion page for the paper — the main results in a browsable form, with a link to the full text on arXiv.

The page covers:

- **The core question** — when a balanced training mixture helps, is the gain from the *distribution* of tokens across domains, or merely from the *volume* of data seen?
- **The allocation signature** — balanced (equal tokens per corpus) versus natural (native proportions), across five domains at a fixed budget.
- **The 5-stage pipeline** — Prune → Allocate → Select → Fine-tune → Evaluate.
- **The five findings**, one per research question.
- **An interactive budget-ladder explorer** — balanced versus natural quality across the 2→32M token ladder, switchable by corpus and metric.
- **The five meeting corpora**, split into data-scarce minority and data-rich majority domains.
- **The unit of balancing** — why tokens, not examples, are the right unit.
- **Generalisation** — the same redistribution on a smaller model (Llama-3.2-3B).
- **Evaluation** — automatic metrics plus a fact-level LLM judge, validated by a two-annotator study.
- **Practitioner takeaways and limitations.**

## TL;DR

We fine-tune **Mistral-7B with QLoRA** on **five English meeting corpora** (AMI, ICSI, ELITR, EuroParlMin, MeetingBank) whose sizes span more than two orders of magnitude. By building **balanced** and **natural** token mixtures at **matched budgets** (2–32M tokens), we separate the effect of token *distribution* from data *volume*. Headline results: (1) balancing **redistributes** quality — it lifts the three data-scarce minority domains and slightly lowers the two majority domains, rather than adding quality uniformly; (2) the minority gap **stays open** across the whole budget ladder; (3) pruning conversational filler removes **6.8%** of tokens at no measurable cost; (4) **tokens, not examples**, are the right unit of balancing; (5) the pattern **replicates** on Llama-3.2-3B.


## Citation

```bibtex
@inproceedings{sood2026domainbalancing,
  title     = {Token Distribution versus Data Volume: Domain Balancing
               in Multi-Domain Meeting Summarisation},
  author    = {Sood, Ashima and Gardiner, Bryan and Condell, Joan},
  booktitle = {Proceedings of the 19th International Natural Language
               Generation Conference (INLG)},
  year      = {2026},
  note      = {arXiv:2608.15935}
}
```
