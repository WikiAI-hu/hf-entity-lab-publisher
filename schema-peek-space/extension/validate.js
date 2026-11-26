/* Local, bounded inspection of common Schema.org JSON-LD authoring patterns.
   Deliberately not a JSON-LD expansion engine or a conformance validator. */
import {vocabulary as V} from './vocabulary.js';
const own=(o,k)=>Object.hasOwn(o,k);
const arr=x=>Array.isArray(x)?x:[x];
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const termRE=/^https?:\/\/(?:www\.)?schema\.org\/([^\/#?]+)$/i;
const schemaBase=/^https?:\/\/(?:www\.)?schema\.org\/?$/i;
const standardContext=/^https?:\/\/(?:www\.)?schema\.org(?:\/?|\/docs\/jsonldcontext\.jsonld)$/i;
const keywords=new Set('@base @container @context @direction @graph @id @import @included @index @json @language @list @nest @none @prefix @propagate @protected @reverse @set @type @value @version @vocab'.split(' '));
const specialGoogle=new Set(['query-input','query-output']);
const properties=new Set(V.properties);
const hasClass=t=>own(V.classes,t);
const hasEnum=t=>own(V.enumerations,t);
const clip=(x,n=300)=>String(x??'').slice(0,n);
const keypath=(p,k)=>clip(p+( /^[A-Za-z_][\w-]*$/.test(k)?'.'+k:'['+JSON.stringify(clip(k,100))+']'),400);
const MAX_NODES=30000,MAX_FINDINGS=500,MAX_VALUES=1000,MAX_CHECKS=100000;
const rootContext={schema:false,uncertain:false,aliases:Object.create(null),prefixes:Object.create(null),base:null};
function applyContext(parent,raw){
  if(raw===undefined)return parent;
  let c={...parent,aliases:Object.assign(Object.create(null),parent.aliases),prefixes:Object.assign(Object.create(null),parent.prefixes)};
  for(const part of arr(raw)){
    if(part===null){c={...rootContext,aliases:Object.create(null),prefixes:Object.create(null)};continue;}
    if(typeof part==='string'){
      if(standardContext.test(part)){c.schema=true;c.prefixes.schema='https://schema.org/';}
      else c.uncertain=true;
      continue;
    }
    if(!plain(part)){c.uncertain=true;continue;}
    if(own(part,'@vocab')){c.schema=typeof part['@vocab']==='string'&&schemaBase.test(part['@vocab']);if(part['@vocab']!==null&&!c.schema)c.uncertain=true;}
    if(own(part,'@base')){if(typeof part['@base']==='string')c.base=part['@base'];else c.uncertain=true;}
    if(own(part,'@import')||own(part,'@propagate')||own(part,'@protected'))c.uncertain=true;
    for(const [k,v] of Object.entries(part)){
      if(k.startsWith('@'))continue;
      const id=typeof v==='string'?v:plain(v)?v['@id']:null;
      if(v===null){c.aliases[k]=null;delete c.prefixes[k];continue;}
      if(plain(v)&&(own(v,'@context')||own(v,'@container')||own(v,'@reverse')||own(v,'@nest')))c.uncertain=true;
      if(typeof id==='string'){
        if(schemaBase.test(id)){c.prefixes[k]='https://schema.org/';continue;}
        c.aliases[k]=id;
        if(id.endsWith('/')||id.endsWith('#'))c.prefixes[k]=id;
      }else c.uncertain=true;
    }
  }
  return c;
}
function expandTerm(raw,c,depth=0){
  if(typeof raw!=='string'||depth>6)return {kind:'other',value:raw};
  if(keywords.has(raw))return {kind:'keyword',value:raw};
  if(own(c.aliases,raw)){
    const a=c.aliases[raw];if(a===null||a===raw)return {kind:'other',value:raw};
    return expandTerm(a,c,depth+1);
  }
  const absolute=raw.match(termRE);if(absolute)return {kind:'schema',value:absolute[1]};
  const colon=raw.indexOf(':');
  if(colon>0){const p=raw.slice(0,colon),local=raw.slice(colon+1);if(own(c.prefixes,p)&&schemaBase.test(c.prefixes[p]))return {kind:'schema',value:local};return {kind:'other',value:raw};}
  return c.schema&&!c.uncertain&&!raw.startsWith('@')?{kind:'schema',value:raw}:{kind:'other',value:raw};
}
function subclass(a,b){if(a===b)return true;const seen=new Set(),stack=[a];while(stack.length){const k=stack.pop();if(seen.has(k))continue;seen.add(k);for(const p of (hasClass(k)?V.classes[k]:[])){if(p===b)return true;stack.push(p);}}return false;}
function normId(raw,base){if(typeof raw!=='string'||raw.startsWith('_:'))return raw;try{return new URL(raw,base).href;}catch{return raw;}}
function typesOf(v,c){return arr(v).filter(x=>typeof x==='string').map(x=>expandTerm(x,c));}
function objectFields(obj,c){const fields=new Map();for(const [k,v] of Object.entries(obj)){const e=expandTerm(k,c);if(e.kind==='keyword'||e.kind==='schema')fields.set(e.value,v);}return fields;}
function actualValue(v,c,base,idMap){
  if(v===null)return null; // null is ignored by JSON-LD
  if(plain(v)){
    const child=applyContext(c,v['@context']);const f=objectFields(v,child);
    if(f.has('@value'))return actualValue(f.get('@value'),child,base,idMap);
    if(f.has('@list')||f.has('@set'))return null; // handled in values below
    const ts=typesOf(f.get('@type'),child);const known=ts.filter(t=>t.kind==='schema'&&hasClass(t.value)).map(t=>t.value);
    const id=f.get('@id');const d=typeof id==='string'?idMap.get(normId(id,child.base?normId(child.base,base):base)):null;
    if(d)known.push(...d.types);
    if(known.length)return {types:[...new Set(known)],kind:'object',id:typeof id==='string'?id:null,uncertain:child.uncertain||ts.some(t=>t.kind!=='schema'||!hasClass(t.value))||!!d?.uncertain};
    if(typeof id==='string'){
      const enumTerm=expandTerm(id,child);if(enumTerm.kind==='schema'&&hasEnum(enumTerm.value))return {types:V.enumerations[enumTerm.value],kind:'enum',id};
      return {types:[],kind:'reference',id,uncertain:true};
    }
    return null;
  }
  if(typeof v==='string'){
    const e=expandTerm(v,c);if(e.kind==='schema'&&hasEnum(e.value))return {types:V.enumerations[e.value],kind:'enum',literal:v};
    const types=['Text'];if(/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(v))types.push('URL');if(/^\d{4}-\d\d-\d\d$/.test(v))types.push('Date');if(/^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(v))types.push('DateTime');if(/^\d\d:\d\d(?::\d\d(?:\.\d+)?)?(?:Z|[+-]\d\d:\d\d)?$/.test(v))types.push('Time');if(/^P(?:\d|T)/.test(v))types.push('Duration');if(/^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(v))types.push('Number',...(Number.isInteger(Number(v))?['Integer']:['Float']));if(/^(true|false)$/i.test(v))types.push('Boolean');
    return {types,kind:'text',literal:v};
  }
  if(typeof v==='boolean')return {types:['Boolean'],kind:'boolean'};
  if(typeof v==='number'&&Number.isFinite(v))return {types:[Number.isInteger(v)?'Integer':'Float'],kind:'number'};
  return null;
}
function valueItems(v,c){const out=[],stack=[v];let steps=0,truncated=false;while(stack.length&&steps++<MAX_VALUES){const x=stack.pop();if(Array.isArray(x)){if(x.length>MAX_VALUES)truncated=true;for(let i=Math.min(x.length,MAX_VALUES)-1;i>=0;i--)stack.push(x[i]);continue;}if(plain(x)){const f=objectFields(x,applyContext(c,x['@context']));if(f.has('@list')||f.has('@set')){stack.push(f.get('@list')??f.get('@set'));continue;}}out.push(x);}return {items:out,limited:truncated||stack.length>0};}
function typeMatches(actual,expected){return actual.some(a=>expected.some(e=>subclass(a,e)));}
function typeLabels(t){return t.map(x=>x.value).filter(Boolean);}
export function validateReport(report){
  const out={version:'wikiai-schema-peek-validation/1',vocabulary:{version:V.version,releaseDate:V.releaseDate,source:V.source,sourceBlob:V.sourceBlob,classes:Object.keys(V.classes).length,properties:V.properties.length,enumerationValues:Object.keys(V.enumerations).length,domainRangeRules:Object.keys(V.rules).length,coverage:V.coverage},scope:'Schema.org vocabulary lookup and selected domain/range guidance; common literal/IRI contexts only; no full JSON-LD expansion, RDF validation or Google Rich Results eligibility',stats:{errors:0,warnings:0,info:0,checkedTypes:0,checkedProperties:0,domainChecks:0,rangeChecks:0,skippedContexts:0,checkedObjects:0},findings:[],limits:[]};
  const seenFindings=new Set(),records=[],idMap=new Map(),refRecords=[],contexts=new Set();let visited=0,checks=0;
  const limit=k=>{if(!out.limits.includes(k))out.limits.push(k);};
  const add=(severity,code,r,property,actual,expected)=>{
    const f={severity,code,block:r?.block??null,path:r?.path??'$',property:property?clip(property,160):null,actual:actual===undefined?null:clip(actual,500),expected:expected===undefined?null:clip(expected,500)};
    const key=JSON.stringify(f);if(seenFindings.has(key))return;if(seenFindings.size>=10000){limit('findings');return;}seenFindings.add(key);
    out.stats[severity==='error'?'errors':severity==='warning'?'warnings':'info']++;
    if(out.findings.length<MAX_FINDINGS)out.findings.push(f);else limit('findings');
  };
  const pageBase=report.page.baseUrl||report.page.url||'https://example.invalid/';
  for(const b of report.blocks||[]){
    if(b.status==='error'){add('error','jsonError',{block:b.index,path:'$'},null,b.error,'valid JSON object or array');continue;}
    if(b.status!=='parsed')continue;
    let data;try{data=JSON.parse(b.raw.replace(/^\uFEFF/,''));}catch{continue;}
    const stack=[{v:data,c:rootContext,p:'$',b:b.index,base:pageBase}];
    while(stack.length){if(++visited>MAX_NODES){limit('nodes');break;}const {v,c,p,b,base}=stack.pop();if(!v||typeof v!=='object')continue;
      if(Array.isArray(v)){if(v.length>MAX_VALUES)limit('values');for(let i=Math.min(v.length,MAX_VALUES)-1;i>=0;i--)if(v[i]&&typeof v[i]==='object')stack.push({v:v[i],c,p:clip(`${p}[${i}]`,400),b,base});continue;}
      let ctx=applyContext(c,v['@context']);const scopedBase=ctx.base?normId(ctx.base,base):base;if(ctx.base&&ctx.base!==scopedBase)ctx={...ctx,base:scopedBase};
      const f=objectFields(v,ctx);const r={block:b,path:p,v,c:ctx,base:scopedBase,f};
      if(ctx.uncertain){out.stats.skippedContexts++;if(!contexts.has(b)){contexts.add(b);add('info','contextLimited',r,'@context',undefined,'standard or simple Schema.org context');}}
      if(!f.has('@value')&&!f.has('@list')&&!f.has('@set')){
        records.push(r);out.stats.checkedObjects++;
        const typ=f.get('@type'),id=f.get('@id');
        if(typ!==undefined&&typ!==null&&arr(typ).some(t=>typeof t!=='string'))add('error','typeShape',r,'@type',typeof typ,'string or array of strings');
        if(id!==undefined&&id!==null&&typeof id!=='string')add('error','idShape',r,'@id',typeof id,'string IRI');
        const ts=typesOf(typ,ctx);r.types=ts;r.known=ts.filter(t=>t.kind==='schema'&&hasClass(t.value)).map(t=>t.value);
        for(const t of ts)if(t.kind==='schema'){out.stats.checkedTypes++;if(!hasClass(t.value))add('warning','unknownType',r,'@type',t.value,'Schema.org '+V.version);}
        if(typeof id==='string'&&id){r.id=normId(id,scopedBase);const keys=Object.keys(v).filter(k=>!['@id','@context','@index'].includes(expandTerm(k,ctx).value));if(keys.length===0){refRecords.push(r);}else{const entry=idMap.get(r.id)||{types:[],names:new Set(),records:[],uncertain:false};entry.types.push(...r.known);entry.uncertain ||= ctx.uncertain||ts.some(t=>t.kind!=='schema'||!hasClass(t.value));const n=f.get('name');for(const x of arr(n))if(typeof x==='string'&&x.trim())entry.names.add(x.trim());entry.records.push(r);idMap.set(r.id,entry);}}
      }
      // Do not traverse context or literal language/value objects as nodes.
      if(f.has('@value'))continue;
      const es=Object.entries(v).filter(([k,val])=>!['@context','@id','@type','@value'].includes(expandTerm(k,ctx).value)&&val&&typeof val==='object');
      if(es.length>MAX_VALUES)limit('values');for(let i=Math.min(es.length,MAX_VALUES)-1;i>=0;i--){const [k,val]=es[i];stack.push({v:val,c:ctx,p:keypath(p,k),b,base:scopedBase});}
    }
    if(visited>MAX_NODES)break;
  }
  for(const r of records){
    if(checks>=MAX_CHECKS){limit('checks');break;}
    const combined=r.id?idMap.get(r.id):null;
    const types=[...new Set([...(r.known||[]),...(combined?.types||[])])];
    const uncertain=r.c.uncertain||r.types?.some(t=>t.kind!=='schema'||!hasClass(t.value))||combined?.uncertain;
    for(const [k,val] of Object.entries(r.v)){
      if(++checks>MAX_CHECKS){limit('checks');break;}
      const e=expandTerm(k,r.c);if(e.kind!=='schema')continue;
      const prop=e.value;
      if(specialGoogle.has(prop))continue;
      out.stats.checkedProperties++;
      if(!properties.has(prop)){add('warning','unknownProperty',r,prop,prop,'Schema.org '+V.version);continue;}
      const rule=V.rules[prop];if(!rule)continue;
      const [domain,range]=rule;
      if(domain.length&&types.length&&!uncertain){out.stats.domainChecks++;if(!typeMatches(types,domain))add('warning','domainMismatch',r,prop,types.join(', '),domain.join(', '));}
      const {items,limited}=valueItems(val,r.c);if(limited)limit('values');
      for(const v of items){
        if(++checks>MAX_CHECKS){limit('checks');break;}
        if(prop==='sameAs'&&v!==null){
          const vf=plain(v)?objectFields(v,applyContext(r.c,v['@context'])):null;
          const raw=typeof v==='string'?v:vf?.get('@id')??vf?.get('@value')??null;
          if(typeof raw!=='string'||!raw.trim())add('warning','sameAsShape',r,prop,typeof v,'identity URL or IRI reference');
          else {if(!/^[a-z][a-z0-9+.-]*:/i.test(raw)&&!raw.startsWith('//'))add('warning','sameAsRelative',r,prop,raw,'explicit identity URL/IRI');if(r.id&&normId(raw,r.base)===r.id)add('info','selfSameAs',r,prop,raw,'another identifier for the same entity');}
        }
        if(!range.length)continue;
        const a=actualValue(v,r.c,r.base,idMap);if(!a)continue;
        if(a.kind==='reference'&&range.includes('URL'))continue;
        if(a.kind==='reference'||a.uncertain)continue;
        if(!a.types.length)continue;
        out.stats.rangeChecks++;
        if(typeMatches(a.types,range))continue;
        if(a.kind==='object'&&a.id&&range.includes('URL'))continue;
        if(typeMatches(a.types,['Role']))continue; // Schema.org permits Role intermediary
        // Text/URL are widely accepted fallbacks in Schema.org. Don't call a plain string a hard error.
        if(a.kind==='text'){
          // Check literal formats for expected datatypes without claiming a full ISO/RDF validation.
          if(range.every(x=>['Boolean','Integer','Float','Number','Date','DateTime','Time','Duration'].includes(x)))add('warning','literalFormat',r,prop,clip(a.literal,160),range.join(', '));
          else if(range.some(x=>subclass(x,'Enumeration'))&&/^https?:\/\/(?:www\.)?schema\.org\//i.test(a.literal))add('warning','rangeMismatch',r,prop,clip(a.literal,160),range.join(', '));
          continue;
        }
        add('warning','rangeMismatch',r,prop,a.types.join(', '),range.join(', '));
      }
    }
  }
  const thisDoc=(report.page.url||pageBase).split('#')[0];
  if(!out.limits.length&&!(report.limits||[]).length){
    for(const r of refRecords){if(typeof r.id==='string'&&!r.id.startsWith('_:')&&r.id.startsWith(thisDoc+'#')&&!idMap.has(r.id))add('info','localReference',r,'@id',r.id,'matching declaration in the inspected JSON-LD');}
  }
  for(const [id,d] of idMap){
    if(d.records.length<2)continue;
    const unique=[...new Set(d.types)];
    if(typeMatches(unique,['Person'])&&typeMatches(unique,['Organization']))add('warning','mixedIdentityTypes',d.records[0],'@id',id,'review Person and Organization identity separation');
    if(d.names.size>1)add('info','differentNames',d.records[0],'name',[...d.names].slice(0,5).join(' / '),'review names; multilingual or alternate labels may be intentional');
  }
  if((report.page.canonical||[]).length>1)add('warning','multipleCanonical',null,'canonical',String(report.page.canonical.length),'review canonical declarations');
  if(report.stats?.blocks&&!records.some(r=>r.c.schema||r.types?.some(t=>t.kind==='schema')))add('info','noSchemaContext',null,'@context',undefined,'recognizable Schema.org namespace/context');
  out.findings.sort((a,b)=>({error:0,warning:1,info:2})[a.severity]-({error:0,warning:1,info:2})[b.severity]);
  return out;
}
