---
pretty_name: WikiAI Entity Lab
dataset_summary: Source-linked public WikiAI.hu editorial entity and Linked Data records, with provenance and rights limitations.
language:
  - hu
  - en
license: other
task_categories:
  - text-retrieval
tags:
  - hungarian
  - entity-resolution
  - knowledge-graph
  - linked-data
  - json-ld
  - structured-data
configs:
  - config_name: business_profiles
    data_files:
      - split: train
        path: data/business_profiles.jsonl
  - config_name: wikiai_knowledge
    data_files:
      - split: train
        path: data/wikiai_knowledge.jsonl
  - config_name: identity_registry
    data_files:
      - split: train
        path: data/entities.jsonl
  - config_name: research_publications
    data_files:
      - split: train
        path: data/research_publications.jsonl
  - config_name: faq
    data_files:
      - split: train
        path: data/faqs.jsonl
  - config_name: portfolio_references
    data_files:
      - split: train
        path: data/portfolio_references.jsonl
  - config_name: public_articles
    data_files:
      - split: train
        path: data/public_articles.jsonl
  - config_name: person_profiles
    data_files:
      - split: train
        path: data/person_profiles.jsonl
---

# WikiAI Entity Lab — source-linked public knowledge (v0.3.0)

**Publisher:** [WikiAI.hu](https://www.wikiai.hu/) · **Snapshot:** 22 October 2026 · **Hugging Face:** [wikiaihu](https://huggingface.co/wikiaihu) · **Publishing source:** [GitHub](https://github.com/WikiAI-hu/hf-entity-lab-publisher).

This dataset is a **third-layer public distribution of editorial metadata**. The canonical authority for public assertions is WikiAI.hu, and its [GitHub knowledge mirror](https://github.com/WikiAI-hu/wikiai-entities) is a secondary revisioned representation. This Hub distribution is not a new canonical website, a business-ownership certificate, or independent proof of claims.

## Contents (78 source-linked records)

| Configuration | Records | Purpose |
|---|---:|---|
| `business_profiles` | 17 | Short editorial descriptions and source references for external business profiles |
| `wikiai_knowledge` | 9 | WikiAI organization, public team and platform document snapshots |
| `identity_registry` | 4 | Separate public WikiAI, editor, founder and independent service identities |
| `research_publications` | 3 | DOI-identified works authored by Csanád Várhelyi |
| `faq` | 20 | Public search-intent questions and answers from the canonical expert page |
| `portfolio_references` | 14 | Publicly presented project URLs, not a list of confirmed paid engagements |
| `public_articles` | 10 | Public Medium and LinkedIn editorial links |
| `person_profiles` | 1 | Full professional text snapshot with a separately redacted 118-node JSON-LD profile graph |
| **Total** | **78** | |

A separate `entity-graph.jsonld` provides 30 linked-data nodes and editorial provenance pointers. The additional [`graphs/varhelyi-csanad-public.jsonld`](graphs/varhelyi-csanad-public.jsonld) preserves the 118 main nodes of the supplied professional graph after privacy redaction; [`profiles/varhelyi-csanad.md`](profiles/varhelyi-csanad.md) contains the accompanying complete public professional text. It is a **curated public projection**; it is **not** a complete copy of the live private/operational JSON-LD graph in WordPress.

## Public personal profile (privacy-redacted)

The `person_profiles` configuration contains the full public professional Markdown snapshot of Csanád Várhelyi / Várhelyi Csanád, including career history, qualifications, publications, documented talks, references, editorial activity and published FAQs. The standalone, sanitized 118-node JSON-LD graph preserves the source's semantic relationships, with personal data minimization applied to both exports.

**Location disclosed:** Hajdúszoboszló, Hungary. **Excluded:** birth date and birthplace, precise postal address, private contact details, tax and company registration IDs, and D-U-N-S. The full WordPress graph and canonical website are not modified by this export. Business/project geography (e.g. Debrecen) may remain as subject matter, not a residence claim. The export does not assert third-party endorsement or model-generated ranking guarantees.

## Canonical entity separation

- **WikiAI.hu**: publisher and editorial platform, established on **8 September 2026**, founded and operated by **Várhelyi Viktória**.
- **Várhelyi Csanád / Csanád Várhelyi / Csanad Varhelyi**: responsible editor and lead editorial author. Independent professional service activity is linked but **separate** from the WikiAI publishing entity.
- **Organization:** [WikiAI canonical information](https://www.wikiai.hu/wikiai-hu/) · **Editor:** [canonical professional profile](https://www.wikiai.hu/szakertok/varhelyi-csanad/).
- The public identifying metadata is source-reported. Google Place, Maps and Knowledge Graph IDs appearing in records or the JSON-LD graph have **not** all been independently validated through the corresponding platforms' APIs. No Google ranking, Knowledge Panel, LLM citation or recommendation is promised.

## Provenance

The first two configurations come from the previously prepared **26-record source snapshot**: [GitHub dataset v0.1](https://github.com/WikiAI-hu/wikiai-entities/tree/454892330dbe09dc73ce3ee1bad7b99cda12f06e/huggingface/wikiai-entity-knowledge), derived from the pinned knowledge mirror revision [454892330dbe09dc73ce3ee1bad7b99cda12f06e](https://github.com/WikiAI-hu/wikiai-entities/commit/454892330dbe09dc73ce3ee1bad7b99cda12f06e). The 20 FAQ answers and 14 portfolio links are derived from the [published professional profile](https://www.wikiai.hu/szakertok/varhelyi-csanad/) and its public [Markdown mirror](https://github.com/WikiAI-hu/wikiai-entities/blob/main/wikiai/people/varhelyi-csanad.md) as of the stated snapshot date. The DOI works are referenced as **the editor's publications**, not as peer-reviewed institutional WikiAI research.

An external business record is an **editorial third-party description**, not a statement written or necessarily approved by the business. External work in the portfolio may represent different types and levels of involvement. Canonical pages should be used for current role, pricing, availability and other time-sensitive details.

## DOI, version and citation

The original Hugging Face Dataset revision **`257860c`** received DOI **[10.57967/hf/11200](https://doi.org/10.57967/hf/11200)** in 2026.

```bibtex
@misc{wikiai.hu_2026,
  author = {WikiAI.hu},
  title = {entity-lab (Revision 257860c)},
  year = {2026},
  url = {https://huggingface.co/datasets/wikiaihu/entity-lab},
  doi = {10.57967/hf/11200},
  publisher = {Hugging Face}
}
```

**Citation note:** this DOI identifies that **original revision**, not necessarily the present v0.2.0 contents. For reproducibility, cite the specific later revision/hash when relying on later records. A DOI does not certify assertions, author identities or peer review.

## Rights, privacy and ethical use

**License metadata: `other`.** Rights remain with their respective holders. This page does **not** grant an open data licence, broad commercial reuse licence, third-party content reuse rights, or model-training permission. The `train` split label is a conventional dataset filename field and grants no training rights. See the [WikiAI transparency and copyright policy](https://www.wikiai.hu/ai-atlathatosag-szerzoi-jogok/).

Sensitive identifiers, confidential client data and proprietary implementation recipes are not included in this release. No personal business-profile identifiers from decommissioned services are asserted here. This public projection does not replace the official WordPress/HFCM schema.

## Technical structure

- `data/*.jsonl` — machine-readable records with configuration-specific schemas (including the complete privacy-redacted professional text)
- `profiles/varhelyi-csanad.md` — complete human-readable professional profile snapshot
- `graphs/varhelyi-csanad-public.jsonld` — 118-node source-linked, privacy-redacted professional graph
- `entity-graph.jsonld` — public Linked Data and editorial source relationships
- [Publishing code and controls](https://github.com/WikiAI-hu/hf-entity-lab-publisher) — validation, OIDC publishing, public metadata history
- [Separate Hugging Face Entity Lab Space](https://huggingface.co/spaces/wikiaihu/entity-lab) — distinct from this dataset and its machine-readable records

**Maintained by WikiAI.hu.** English and Hungarian descriptive material is for human comprehension; source URLs remain primary for checking current facts.

---

## Magyar összefoglaló

A WikiAI Entity Lab a [WikiAI.hu](https://www.wikiai.hu/) **77 nyilvánosan hivatkozott metaadatrekordját** közzétevő Hugging Face-adatkészlet. Tartalma 17 szerkesztőségi vállalkozásprofil, 9 WikiAI- és szakmai oldalrekord, 4 önálló entitásazonosító-rekord, 3 DOI-val azonosított publikáció, 20 GYIK, 14 referenciahivatkozás és 10 nyilvános cikklink. A WikiAI.hu elsődleges forrás; a gépi tükör és ez az adattár **nem jelenti a harmadik felek jóváhagyását vagy az AI-ajánlás garanciáját**.
