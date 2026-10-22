---
pretty_name: WikiAI Entity Lab
dataset_summary: Public entity and Linked Data records maintained by WikiAI.hu.
language:
- hu
- en
tags:
- linked-data
- knowledge-graph
- json-ld
- entities
configs:
- config_name: default
  data_files:
  - split: train
    path: data/*.jsonl
---

# WikiAI Entity Lab

Public machine-readable entity registry and Linked Data publication area maintained by **[WikiAI.hu](https://www.wikiai.hu/)**. The initial release contains one minimal seed identity record to validate publishing, not a complete knowledge graph or independent endorsement.

## DOI and citation

The first deposited revision (`257860c`) received DOI **[10.57967/hf/11200](https://doi.org/10.57967/hf/11200)** (2026). New revisions can receive new DOIs for exact version citations. The DOI is not third-party verification of entity assertions.

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

## Files

- `data/entities.jsonl` — tabular entity records.
- `entity-graph.jsonld` — linked-data identity graph.

## Governance

Records must be public and source traceable. A source URL indicates origin, not independent confirmation. Do not upload credentials, customer-private data or non-public implementation methods. No explicit reuse license has been selected yet.

Maintainer: WikiAI.hu · https://www.wikiai.hu/

GitHub publishing source: https://github.com/WikiAI-hu/hf-entity-lab-publisher
