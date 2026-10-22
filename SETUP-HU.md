# WikiAI Entity Lab – automatikus publikálás

A ChatGPT a csatlakoztatott GitHub eszközzel a `WikiAI-hu/hf-entity-lab-publisher` külön adattár tartalmát kezeli. A GitHub Actions az érvényesített, **publikus** fájlokat a `wikiaihu/entity-lab` Hugging Face Datasetbe publikálja, állandó API-token nélkül.

## Egyszeri Hugging Face beállítás
Nyisd meg: https://huggingface.co/datasets/wikiaihu/entity-lab/settings

A **Trusted Publishers / Megbízható kiadók** alatt rögzítsd:
- Provider: GitHub Actions
- Repository: `WikiAI-hu/hf-entity-lab-publisher`
- Branch: `main`
- Workflow: `publish.yml`

Az adatok betöltéséhez a GitHub `main` ágán lévő `.github/workflows/publish.yml` automatikusan fut, ha a `dataset/` fájlok változnak.

## Ellenőrzés
- GitHub Actions: https://github.com/WikiAI-hu/hf-entity-lab-publisher/actions
- Hugging Face fájlok: https://huggingface.co/datasets/wikiaihu/entity-lab/tree/main
- Első DOI: https://doi.org/10.57967/hf/11200 (Revision `257860c`)

A DOI egy konkrét revízió bibliográfiai hivatkozása; későbbi verzióra új DOI készülhet. A DOI-val rendelkező repó törlése, átnevezése és láthatóságának módosítása korlátozott, és ügyfélszolgálati támogatást igényelhet.

## Biztonság
Sem jelszó, sem API-token, sem bizalmas ügyféladat, sem védett technikai recept ne kerüljön ebbe a nyilvános adattárba. A kezdeti entitásadat csak technikai tesztadat, nem külső hitelesítés. Adatlicencet az adattár tulajdonosa választ.
