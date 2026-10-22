#!/usr/bin/env python3
"""Validate the public WikiAI Entity Lab seed before publication."""
import json
from pathlib import Path
from urllib.parse import urlparse

base = Path(__file__).resolve().parents[1] / "dataset"
required = ("entity_id", "entity_type", "name", "canonical_url", "language", "source_url")
assert (base / "README.md").exists(), "Missing dataset README"
records = []
seen = set()
for path in sorted((base / "data").glob("*.jsonl")):
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        rec = json.loads(line)
        assert isinstance(rec, dict), f"{path}:{line_no}: not an object"
        for key in required:
            assert isinstance(rec.get(key), str) and rec[key].strip(), f"Missing {key}"
        for key in ("entity_id", "canonical_url", "source_url"):
            url = urlparse(rec[key])
            assert url.scheme == "https" and url.netloc, f"Invalid URL: {key}"
        assert rec["entity_id"] not in seen, "Duplicate entity ID"
        seen.add(rec["entity_id"])
        records.append(rec)
assert records, "No JSONL records"
graph = json.loads((base / "entity-graph.jsonld").read_text(encoding="utf-8"))
assert isinstance(graph, dict) and isinstance(graph.get("@graph"), list), "Invalid graph"
graph_ids = set()
for node in graph["@graph"]:
    assert isinstance(node, dict) and node.get("@type"), "Invalid graph node"
    url = urlparse(node.get("@id", ""))
    assert url.scheme == "https" and url.netloc, "Invalid node @id"
    assert node["@id"] not in graph_ids, "Duplicate graph @id"
    graph_ids.add(node["@id"])
assert seen <= graph_ids, "JSONL entity IDs missing from graph"
for path in base.rglob("*"):
    if path.is_file():
        assert path.suffix.lower() not in {".pem", ".key", ".p12", ".env"} and not path.name.startswith(".env"), "Secret-like file found"
print(f"OK: {len(records)} entities, {len(graph_ids)} graph nodes")
