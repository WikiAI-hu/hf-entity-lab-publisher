#!/usr/bin/env python3
"""Validate public editorial metadata, linked data, provenance and restricted content."""
import json
from pathlib import Path
from urllib.parse import urlparse

root = Path(__file__).resolve().parents[1] / "dataset"
expected = {
    "business_profiles.jsonl": 17,
    "wikiai_knowledge.jsonl": 9,
    "entities.jsonl": 4,
    "research_publications.jsonl": 3,
    "faqs.jsonl": 20,
    "portfolio_references.jsonl": 14,
    "public_articles.jsonl": 10,
    "person_profiles.jsonl": 1,
}
assert (root / "README.md").exists(), "Dataset card missing"
former_host = "varhelyicsanad" + "." + "hu"
disallowed_keys = {"duns", "iso6523code", "taxid", "password", "secret", "api_key"}
records = {}
for filename, expected_count in expected.items():
    path = root / "data" / filename
    assert path.is_file(), f"Missing {filename}"
    parsed = []
    for ln, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        obj = json.loads(line)
        assert isinstance(obj, dict) and obj, f"{filename}:{ln} invalid record"
        assert not (set(k.lower() for k in obj) & disallowed_keys), f"Restricted key in {filename}:{ln}"
        parsed.append(obj)
    assert len(parsed) == expected_count, f"{filename} expected {expected_count}; got {len(parsed)}"
    records[filename] = parsed

assert len({x["record_id"] for x in records["business_profiles.jsonl"] + records["wikiai_knowledge.jsonl"]}) == 26, "Duplicate original record"
assert len({x["entity_id"] for x in records["entities.jsonl"]}) == 4, "Duplicate canonical identity"
assert len({x["record_id"] for x in records["faqs.jsonl"]}) == 20, "Duplicate FAQ"
assert len({x["record_id"] for x in records["portfolio_references.jsonl"]}) == 14, "Duplicate portfolio reference"
assert len({x["doi"] for x in records["research_publications.jsonl"]}) == 3, "Duplicate DOI"
for f in ("business_profiles.jsonl","wikiai_knowledge.jsonl"):
    for item in records[f]:
        assert item.get("canonical_url", "").startswith("https://www.wikiai.hu/"), "Noncanonical business index URL"
        assert item.get("source_url", "").startswith("https://github.com/WikiAI-hu/wikiai-entities/"), "Broken pinned-source provenance"
for item in records["entities.jsonl"]:
    assert urlparse(item["entity_id"]).scheme == "https", "Invalid identity URI"

graph = json.loads((root / "entity-graph.jsonld").read_text(encoding="utf-8"))
assert graph.get("@context") == "https://schema.org" and isinstance(graph.get("@graph"), list), "Invalid graph"
ids = [node.get("@id") for node in graph["@graph"]]
assert len(ids) == len(set(ids)) and all(urlparse(x or "").scheme == "https" for x in ids), "Duplicate or invalid graph node ID"
assert {x["entity_id"] for x in records["entities.jsonl"]} <= set(ids), "Identity omitted from graph"
for path in root.rglob("*"):
    if path.is_file():
        assert not path.name.lower().endswith((".env", ".pem", ".key", ".p12")), "Secret-like file"
        body = path.read_text(encoding="utf-8")
        assert former_host not in body.lower(), "Deprecated host reference in public data"
        assert not any('"' + x + '"' in body.lower() for x in ("duns", "iso6523code", "taxid")), "Restricted attribute in public data"

# The public expert profile is a redacted, separately published copy of the 118-node graph.
profile = root / "profiles" / "varhelyi-csanad.md"
expert_graph_path = root / "graphs" / "varhelyi-csanad-public.jsonld"
assert profile.is_file() and expert_graph_path.is_file(), "Missing expert profile or graph"
expert_graph = json.loads(expert_graph_path.read_text(encoding="utf-8"))
assert expert_graph.get("@context") == "https://schema.org", "Expert graph context invalid"
assert len(expert_graph.get("@graph", [])) == 118, "Unexpected expert graph node count"
expert_person = next((n.get("mainEntity") for n in expert_graph["@graph"] if n.get("@type") == "ProfilePage"), None)
assert expert_person and expert_person.get("@id") == "https://www.wikiai.hu/szakertok/varhelyi-csanad/#person", "Person URI mismatch"
assert expert_person.get("workLocation", {}).get("@id") == "https://www.wikiai.hu/szakertok/varhelyi-csanad/#city-hajduszoboszlo", "Incorrect disclosed location"
assert profile.read_text(encoding="utf-8") in records["person_profiles.jsonl"][0]["profile_text"], "Profile text mismatch"
sensitive = ("1991-11-08", "1991. november 8", "302346624", "91944555", "62144267", "déryné utca", "4200 hajdúszoboszló", "varhelyicsanad@gmail.com", "+36702264545", "+36 70 226 4545", "varhelyicsanad.hu", '"birthdate"', '"birthplace"', '"streetaddress"', '"taxid"', '"duns"', '"iso6523code"')
for item in (profile, expert_graph_path, root / "data" / "person_profiles.jsonl"):
    text = item.read_text(encoding="utf-8").lower()
    assert not any(token in text for token in sensitive), f"Sensitive personal data found in {item}"
assert len(records["person_profiles.jsonl"]) == 1, "Exactly one full profile expected"

print("OK: 78 tabular records, 30 organization nodes and 118 redacted professional nodes; public policy checks passed")
