# WikiAI Entity Lab — GitHub publisher

Dedicated **public** publication source for [WikiAI.hu](https://www.wikiai.hu/) entity data. This repository is separate from the existing WikiAI GitHub mirror.

- Target dataset: https://huggingface.co/datasets/wikiaihu/entity-lab
- First dataset DOI: https://doi.org/10.57967/hf/11200 (revision `257860c`; it does not verify the data)
- Publishable source: `dataset/`
- Workflow: `.github/workflows/publish.yml`
- Documentation: `SETUP-HU.md`

A push to `main` modifying the dataset, validation script or publishing workflow triggers validation followed by upload via Hugging Face Trusted Publishers and GitHub Actions OIDC. No long-lived Hugging Face token is required. You can also use Actions → Run workflow.

**Security:** only approved public entity information may be published. Never commit credentials, confidential client data, personal secrets, or proprietary implementation details. Changes to this public repository can automatically become public on Hugging Face.

The initial JSONL and JSON-LD content is a small technical seed, **not** a completed entity registry, independent verification, or an endorsement by Hugging Face. No reuse license has yet been designated. Deleted GitHub files are not automatically deleted from the Hugging Face repository.

## Verify
Run `python3 scripts/validate_dataset.py` and check https://github.com/WikiAI-hu/hf-entity-lab-publisher/actions followed by the dataset's **Files and versions** tab.

Official docs: https://huggingface.co/docs/hub/trusted-publishers
