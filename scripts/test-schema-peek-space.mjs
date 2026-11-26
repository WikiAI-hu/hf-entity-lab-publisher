import test from 'node:test';
import assert from 'node:assert/strict';
import {inspect} from '../schema-peek-space/extension/core.js';
const run=raw=>inspect({url:'https://example.invalid/',baseUrl:'https://example.invalid/',totalBlocks:1,blocks:[{index:1,raw}]});
test('valid JSON-LD and pinned vocabulary',()=>{
  const r=run(JSON.stringify({'@context':'https://schema.org','@type':'Person','@id':'#person',name:'Example person'}));
  assert.equal(r.stats.parsed,1);assert.equal(r.stats.typedObjects,1);assert.equal(r.validation.stats.errors,0);
  assert.equal(r.validation.vocabulary.version,'30.1');assert.equal(r.validation.vocabulary.classes,939);assert.equal(r.validation.vocabulary.properties,1538);assert.equal(r.validation.vocabulary.enumerationValues,546);assert.equal(r.validation.vocabulary.domainRangeRules,309);
});
test('syntax error',()=>assert.equal(run('{').validation.stats.errors,1));
test('unknown vocabulary and mixed identity are flagged',()=>{
  const r=run(JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'Person','@id':'#entity',name:'Person',notARealProperty:true},{'@type':'Organization','@id':'#entity',name:'Organization'},{'@type':'UnknownSchemaClass'}]}));
  for(const code of ['unknownType','unknownProperty','mixedIdentityTypes'])assert.ok(r.validation.findings.some(f=>f.code===code),code);
});
test('local graph reference is not an unresolved reference',()=>{
  const r=run(JSON.stringify({'@context':'https://schema.org','@graph':[{'@type':'Organization','@id':'#org',name:'Organization'},{'@type':'Person','@id':'#person',worksFor:{'@id':'#org'}}]}));
  assert.ok(r.stats.idReferences>=1);assert.ok(!r.validation.findings.some(f=>f.code==='localReference'));
});
test('input limit is explicit',()=>{const r=run(' '.repeat(1000001));assert.equal(r.stats.skipped,1);assert.ok(r.limits.includes('blocks'));});
