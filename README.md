# WikiAI Entity Lab — public publishing source

This dedicated repository is the GitHub Actions publisher for [Hugging Face WikiAI Entity Lab](https://huggingface.co/datasets/wikiaihu/entity-lab), **separate from the pre-existing WikiAI WordPress→GitHub mirror**. The WordPress domain is canonical.

- Hugging Face Dataset: https://huggingface.co/datasets/wikiaihu/entity-lab
- Entity Lab Space (separate): https://huggingface.co/spaces/wikiaihu/entity-lab
- Organization profile card Space (separate): https://huggingface.co/spaces/wikiaihu/README
- Canonical editorial site: https://www.wikiai.hu/
- Original dataset DOI, revision `257860c`: https://doi.org/10.57967/hf/11200

## Published content

`dataset/` is a **curated public projection** of 77 linked editorial records from the WordPress source and its versioned GitHub snapshots: 17 business profiles, 9 WikiAI documents, 4 identity records, 3 editor-authored DOI publications, 20 public FAQs, 14 portfolio reference links and 10 public article links. A separate compact public JSON-LD graph is included.

Changes to `dataset/` trigger `.github/workflows/publish.yml`. It validates inputs then pushes to the Hugging Face dataset using Trusted Publisher OIDC (no stored Hugging Face API token).

`organization-card/README.md` is the cleaned Hugging Face **organization-card Space** content, not a dataset card. The separate `publish-organization.yml` workflow is a manual-only deploy until a Trusted Publisher for `spaces/wikiaihu/README` is separately configured.

**Policy:** no unrelated Google profile identifiers, confidential data, unrestricted research-method recipes or decommissioned personal domain links. Publisher/author and independent business identity remain distinct. `license: other` is not a blanket licence to train models or reproduce third-party works. DOI assignment alone is not a research endorsement.

Validation: `python3 scripts/validate_dataset.py`.

See [Hungarian setup](SETUP-HU.md).
