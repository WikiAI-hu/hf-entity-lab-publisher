# WikiAI Entity Lab – publikálás és engedélyek

Az új kiadói GitHub adattár: https://github.com/WikiAI-hu/hf-entity-lab-publisher. Az eredeti WordPress→GitHub tartalomtükör külön van, és a publikáló rendszer nem ír bele.

## 1. Dataset – OIDC kész
Az `entity-lab` Dataset esetén a Trusted Publisher:
- repository: `WikiAI-hu/hf-entity-lab-publisher`
- branch: `main`
- workflow: `publish.yml`

Publikálás: a `dataset/` könyvtár módosítása után automatikusan indul. 
Ellenőrzés: https://github.com/WikiAI-hu/hf-entity-lab-publisher/actions és https://huggingface.co/datasets/wikiaihu/entity-lab/tree/main

## 2. WikiAI Hugging Face szervezeti kártya – KÜLÖN OIDC beállítás kell
A WikiAI szervezeti bemutatkozás **nem** a Dataset README; az alábbi Space szolgálja ki:
https://huggingface.co/spaces/wikiaihu/README

A Space beállításaiban **Settings → Trusted Publishers → Add**:
- provider: GitHub Actions
- repository: `WikiAI-hu/hf-entity-lab-publisher`
- branch: `main`
- workflow: `publish-organization.yml`

Ezután a GitHub **Actions → Publish WikiAI organization card → Run workflow** indításával a `organization-card/README.md` fájl a Space `README.md` fájljává publikálható. Addig csak GitHubon van előkészítve; az org-oldal tartalmát nem módosítja.

## 3. Adatminőség
A kanonikus állítások WikiAI.hu oldalról erednek, a GitHub tükörből forrásverzió szerint gyűjtött rövid leírásokkal. Az Entity Lab nem azonos egy kutatóintézeti akkreditációval, független harmadik fél általi hitelesítéssel vagy szabad felhasználási engedéllyel.

Az első eredeti DOI: `10.57967/hf/11200` – revízió `257860c`; későbbi változatokhoz a pontos commitot kell hivatkozni.
