import {validateReport} from "./validate.js";
/* Pure functions; no network, persistence, or page mutation. */
const MAX_BLOCK_CHARS = 1_000_000;
const MAX_TOTAL_CHARS = 3_000_000;
const MAX_BLOCKS = 100;
const MAX_NODES = 30_000;
const MAX_ENTITIES = 500;
const MAX_LINKS = 2000;

// This function is also serialized by chrome.scripting.executeScript.
// Keep it self-contained: no closure over module constants.
export function readPage() {
  const all = Array.from(document.querySelectorAll('script[type]')).filter(
    s => (s.getAttribute('type') || '').trim().toLowerCase().split(';')[0].trim() === 'application/ld+json'
  );
  const blocks = [];
  let total = 0;
  for (let i = 0; i < Math.min(all.length, 100); i++) {
    const raw = all[i].textContent || '';
    if (raw.length > 1000000 || total + raw.length > 3000000) {
      blocks.push({index:i+1, skipped:true, length:raw.length});
      continue;
    }
    total += raw.length;
    blocks.push({index:i+1, raw});
  }
  const links = Array.from(document.querySelectorAll('link[rel]'));
  const hasRel = (el, rel) => (el.getAttribute('rel') || '').toLowerCase().split(/\s+/).includes(rel);
  return {
    url:location.href,
    baseUrl:document.baseURI,
    title:document.title,
    language:document.documentElement.lang || '',
    canonical:links.filter(l=>hasRel(l,'canonical')).slice(0,30).map(l=>l.getAttribute('href') || ''),
    hreflang:links.filter(l=>hasRel(l,'alternate') && l.hasAttribute('hreflang')).slice(0,100)
      .map(l=>({language:l.getAttribute('hreflang') || '',href:l.getAttribute('href') || ''})),
    robots:Array.from(document.querySelectorAll('meta[name]')).filter(m=>['robots','googlebot','bingbot'].includes((m.getAttribute('name')||'').toLowerCase())).slice(0,30)
      .map(m=>({name:m.getAttribute('name'),content:m.getAttribute('content') || ''})),
    totalBlocks:all.length, blocks
  };
}

const strings = x => (Array.isArray(x) ? x : [x]).filter(v=>typeof v==='string' && v.length>0);
const idOf = x => typeof x==='string' ? x : x && typeof x==='object' && typeof x['@id']==='string' ? x['@id'] : null;
const labelOf = x => { for(let i=0;i<32 && Array.isArray(x);i++)x=x[0];return typeof x==='string'?x:x&&typeof x==='object'&&typeof x['@value']==='string'?x['@value']:''; };
const own = (obj,key) => Object.hasOwn(obj,key);
const clip = (x,n=500) => String(x??'').slice(0,n);
const pathKey = k => /^[A-Za-z_][\w-]*$/.test(k) ? '.'+k : '['+JSON.stringify(clip(k,100))+']';
const addCount = (map,k) => map.set(k,(map.get(k)||0)+1);

export function inspect(page) {
  const result = {
    format:'wikiai-schema-peek-report/2',
    scope:'current top-level rendered DOM; JSON syntax, structure, Schema.org vocabulary and selected domain/range guidance',
    page:{url:page.url || '',baseUrl:page.baseUrl || page.url || '',title:page.title || '',language:page.language||'',canonical:page.canonical||[],hreflang:page.hreflang||[],robots:page.robots||[]},
    stats:{blocks:Math.max(page.totalBlocks||0,page.blocks?.length||0),parsed:0,errors:0,skipped:0,typedObjects:0,idDeclarations:0,idReferences:0,sameAsValues:0,distinctIds:0,visitedObjects:0},
    typeCounts:[],entities:[],repeatedIds:[],sameAs:[],blocks:[],limits:[],notes:[]
  };
  const counts = new Map(), ids = new Map();
  let chars=0, visited=0, entityLimit=false, linkLimit=false, nodeLimit=false;
  const input=Array.isArray(page.blocks)?page.blocks:[];
  for (let bi=0; bi<Math.min(input.length,MAX_BLOCKS); bi++) {
    const source=input[bi];
    const index=source.index??bi+1;
    if (source.skipped || typeof source.raw!=='string' || source.raw.length>MAX_BLOCK_CHARS || chars+source.raw.length>MAX_TOTAL_CHARS) {
      result.blocks.push({index,status:'skipped',length:source.length??source.raw?.length??0});
      result.stats.skipped++;
      continue;
    }
    chars+=source.raw.length;
    const raw=source.raw;
    let data;
    try { data=JSON.parse(raw.replace(/^\uFEFF/,'')); }
    catch(e) {
      result.stats.errors++;
      result.blocks.push({index,status:'error',error:clip(e.message,300),raw});
      continue;
    }
    if (!data || typeof data!=='object') {
      result.stats.errors++;
      result.blocks.push({index,status:'error',error:'JSON-LD root must be an object or array, not a scalar.',raw});
      continue;
    }
    result.stats.parsed++;
    result.blocks.push({index,status:'parsed',raw});
    // Iterative walk handles deeply nested graphs without recursive stack overflow.
    const stack=[{value:data,path:'$'}];
    while(stack.length) {
      const {value,path}=stack.pop();
      if (!value || typeof value!=='object') continue;
      if (visited>=MAX_NODES) { nodeLimit=true; break; }
      visited++;
      if(Array.isArray(value)) {
        // Avoid enormous pending stacks on adversarial pages.
        const max=Math.min(value.length,MAX_NODES-visited+1);
        if(max<value.length)nodeLimit=true;
        for(let i=max-1;i>=0;i--) if(value[i] && typeof value[i]==='object')stack.push({value:value[i],path:clip(path+'['+i+']',300)});
        continue;
      }
      const types=strings(value['@type']);
      const id=typeof value['@id']==='string' && value['@id'] ? value['@id'] : null;
      const isReference=!!id && Object.keys(value).every(k=>k==='@id'||k==='@context');
      if(id) {
        if(isReference)result.stats.idReferences++;
        else {result.stats.idDeclarations++;addCount(ids,id);}
      }
      if(types.length) {
        result.stats.typedObjects++;
        for(const type of new Set(types))addCount(counts,type);
      }
      if(types.length || (id && !isReference)) {
        if(result.entities.length<MAX_ENTITIES) {
          result.entities.push({block:index,path,types:types.map(x=>clip(x)),id:id?clip(id,2000):null,name:clip(labelOf(value.name||value.headline||value.alternateName)),sameAsCount:Array.isArray(value.sameAs)?value.sameAs.map(idOf).filter(Boolean).length:(idOf(value.sameAs)?1:0)});
        } else entityLimit=true;
      }
      if(own(value,'sameAs')) {
        const values=Array.isArray(value.sameAs)?value.sameAs:[value.sameAs];
        for(const v of values) {
          const href=idOf(v);if(!href)continue;
          result.stats.sameAsValues++;
          if(result.sameAs.length<MAX_LINKS)result.sameAs.push({block:index,path:clip(path+'.sameAs',320),entityId:id?clip(id,2000):null,value:clip(href,2000)});
          else linkLimit=true;
        }
      }
      // @context is vocabulary configuration, not a set of declared page entities.
      // Do not expand remote contexts or resolve aliases/relative identifiers.
      const entries=Object.entries(value).filter(([k,v])=>k!=='@context' && v && typeof v==='object');
      const max=Math.min(entries.length,MAX_NODES-visited+1);
      if(max<entries.length)nodeLimit=true;
      for(let i=max-1;i>=0;i--) {
        const [k,v]=entries[i];stack.push({value:v,path:clip(path+pathKey(k),300)});
      }
    }
  }
  result.stats.visitedObjects=visited;
  result.stats.skipped+=Math.max(0,result.stats.blocks-result.blocks.length);
  result.stats.distinctIds=ids.size;
  result.typeCounts=Array.from(counts,([type,count])=>({type:clip(type),count})).sort((a,b)=>b.count-a.count||a.type.localeCompare(b.type));
  result.repeatedIds=Array.from(ids,([id,count])=>({id:clip(id,2000),count})).filter(x=>x.count>1).sort((a,b)=>b.count-a.count||a.id.localeCompare(b.id));
  if(result.stats.skipped)result.limits.push('blocks');
  if(nodeLimit)result.limits.push('nodes');
  if(entityLimit)result.limits.push('entities');
  if(linkLimit)result.limits.push('sameAs');
  if(result.repeatedIds.length)result.notes.push('repeatedIds');
  if(result.page.canonical.length>1)result.notes.push('multipleCanonical');
  result.validation=validateReport(result);
  return result;
}
