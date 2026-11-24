import { isLanguage, validText, safeName, validAudio, jsonError, fileType } from '../shared/validation';
import { verifyBearer } from './auth';
import {hollyInstructions,cleanCompanionText,isHollyStyle,clampHistory,expressionFromText} from '../shared/holly';

type AI={run:(model:string, input:unknown, options?:unknown)=>Promise<any>};
type Env={AI:AI; DB:D1Database; AUDIO:R2Bucket; ASSETS:Fetcher; AUTH_JWT_SECRET:string; ADMIN_REVIEW_SECRET?:string; ALLOWED_ORIGIN?:string; VOICE_CLONE_ENABLED?:string; VOICE_CLONE_API_URL?:string; VOICE_CLONE_API_TOKEN?:string};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const now=()=>new Date().toISOString();
const audit=async(env:Env,actor:string,event:string,subject?:string)=>env.DB.prepare('INSERT INTO audit_events(id,actor,event,subject_id,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),actor,event,subject??null,now()).run();
const fail=(e:unknown)=>{console.error('Speech engine operation failed',e);return jsonError('Upstream service unavailable or configuration error',502);};
const ALLOWED_SPEAKERS=['angus','asteria','arcas','orion','orpheus','athena','luna','zeus','perseus','helios','hera','stella'];
function responseAudio(result:any):Response {
 if(result instanceof Response)return new Response(result.body,{headers:{'content-type':result.headers.get('content-type')||'audio/mpeg','cache-control':'no-store'}});
 if(result instanceof ReadableStream)return new Response(result,{headers:{'content-type':'audio/mpeg','cache-control':'no-store'}});
 if(result instanceof ArrayBuffer || ArrayBuffer.isView(result))return new Response(result as BodyInit,{headers:{'content-type':'audio/mpeg','cache-control':'no-store'}});
 throw new Error('Unexpected TTS output');
}
async function uploadAudio(req:Request,env:Env,sub:string,kind:string){
 const form=await req.formData();const audio=form.get('audio');
 if(!(audio instanceof File)||!validAudio(audio))return jsonError('Provide audio file of supported type, max 8 MB');
 const id=crypto.randomUUID();const key=`users/${sub.replace(/[^a-zA-Z0-9_-]/g,'_')}/${kind}/${id}`;
 await env.AUDIO.put(key,audio.stream(),{httpMetadata:{contentType:fileType(audio.type)},customMetadata:{owner:sub,kind}});
 await env.DB.prepare('INSERT INTO audio_records(id,owner_id,kind,object_key,content_type,bytes,created_at) VALUES(?,?,?,?,?,?,?)').bind(id,sub,kind,key,fileType(audio.type),audio.size,now()).run();
 return {id,key,audio};
}
async function route(req:Request,env:Env,sub:string,path:string):Promise<Response>{
 if(path==='/api/health'&&req.method==='GET')return json({ok:true,app:'Interface AI Speech',version:'0.1.0'});
 if(path==='/api/languages'&&req.method==='GET')return json({languages:['en','es','fr','de','ja','zh','ar','hi','pt','it','ko','ru']});
 if(path==='/api/translate'&&req.method==='POST'){
  const body=await req.json() as Record<string,unknown>;
  if(!validText(body.text)||!isLanguage(body.source)||!isLanguage(body.target))return jsonError('Invalid text or language');
  if(body.source===body.target)return json({text:body.text,source:body.source,target:body.target});
  try{const out=await env.AI.run('@cf/meta/m2m100-1.2b',{text:body.text,source_lang:body.source,target_lang:body.target});
   const translated=out?.translated_text??out?.translation;
   if(typeof translated!=='string')throw new Error('Translation response mismatch');return json({text:translated,source:body.source,target:body.target});}catch(e){return fail(e);}
 }
 if(path==='/api/stt'&&req.method==='POST'){
  const result=await uploadAudio(req,env,sub,'stt');if(result instanceof Response)return result;
  try{const bytes=await result.audio.arrayBuffer();const out=await env.AI.run('@cf/openai/whisper',{audio:[...new Uint8Array(bytes)]});
   if(typeof out?.text!=='string')throw new Error('Unexpected transcription');return json({text:out.text,audioId:result.id});}catch(e){return fail(e);}
 }
 if(path==='/api/tts'&&req.method==='POST'){
  const body=await req.json() as Record<string,unknown>;
  if(!validText(body.text,1600)||typeof body.speaker!=='string'||!ALLOWED_SPEAKERS.includes(body.speaker))return jsonError('Invalid speech text or speaker');
  try{const out=await env.AI.run('@cf/deepgram/aura-1',{text:body.text,speaker:body.speaker,encoding:'mp3'},{returnRawResponse:true});return responseAudio(out);}catch(e){return fail(e);}
 }
 if(path==='/api/holly/preferences'&&req.method==='GET'){
  const p=await env.DB.prepare('SELECT style,memory_enabled,flirting_enabled,adult_confirmed FROM holly_preferences WHERE owner_id=?').bind(sub).first();
  return json({style:p?.style??'warm',memoryEnabled:p?.memory_enabled===1,flirtingEnabled:p?.flirting_enabled===1,adultConfirmed:p?.adult_confirmed===1});
 }
 if(path==='/api/holly/preferences'&&req.method==='PUT'){
  const b=await req.json() as Record<string,unknown>;
  if(!isHollyStyle(b.style)||typeof b.memoryEnabled!=='boolean'||typeof b.flirtingEnabled!=='boolean'||typeof b.adultConfirmed!=='boolean')return jsonError('Invalid companion preferences');
  if(b.flirtingEnabled&&!b.adultConfirmed)return jsonError('Adult confirmation is required for playful flirting',400);
  await env.DB.prepare('INSERT INTO holly_preferences(owner_id,style,memory_enabled,flirting_enabled,adult_confirmed,updated_at) VALUES(?,?,?,?,?,?) ON CONFLICT(owner_id) DO UPDATE SET style=excluded.style,memory_enabled=excluded.memory_enabled,flirting_enabled=excluded.flirting_enabled,adult_confirmed=excluded.adult_confirmed,updated_at=excluded.updated_at').bind(sub,b.style,Number(b.memoryEnabled),Number(b.flirtingEnabled),Number(b.adultConfirmed),now()).run();
  if(!b.memoryEnabled)await env.DB.prepare('DELETE FROM holly_messages WHERE owner_id=?').bind(sub).run();
  return json({saved:true});
 }
 if(path==='/api/holly/history'&&req.method==='GET'){
  const pref=await env.DB.prepare('SELECT memory_enabled FROM holly_preferences WHERE owner_id=?').bind(sub).first<{memory_enabled:number}>();
  if(pref?.memory_enabled!==1)return json({messages:[]});
  const {results}=await env.DB.prepare('SELECT role,content,created_at FROM holly_messages WHERE owner_id=? ORDER BY created_at DESC LIMIT 20').bind(sub).all();return json({messages:results.reverse()});
 }
 if(path==='/api/holly/history'&&req.method==='DELETE'){
  await env.DB.prepare('DELETE FROM holly_messages WHERE owner_id=?').bind(sub).run();await audit(env,sub,'holly.history.deleted');return json({deleted:true});
 }
 if(path==='/api/holly/chat'&&req.method==='POST'){
  const b=await req.json() as Record<string,unknown>;
  if(!cleanCompanionText(b.message))return jsonError('Message must be 1–2000 characters');
  const pref=await env.DB.prepare('SELECT style,memory_enabled,flirting_enabled,adult_confirmed FROM holly_preferences WHERE owner_id=?').bind(sub).first<{style:string;memory_enabled:number;flirting_enabled:number;adult_confirmed:number}>();
  const style=isHollyStyle(pref?.style)?pref.style:'warm';
  const allowFlirt=pref?.flirting_enabled===1&&pref.adult_confirmed===1;
  let history=clampHistory(b.history);
  if(pref?.memory_enabled===1){const {results}=await env.DB.prepare('SELECT role,content FROM holly_messages WHERE owner_id=? ORDER BY created_at DESC LIMIT 10').bind(sub).all();history=clampHistory(results.reverse());}
  const messages=[{role:'system',content:hollyInstructions(style)+(allowFlirt?' Adult user has opted into mild, nonexplicit playful flirting.':' Flirting is disabled.')},...history,{role:'user',content:b.message}];
  try{const output=await env.AI.run('@cf/meta/llama-3.1-8b-instruct',{messages,max_tokens:350,temperature:0.75});
   const reply=typeof output?.response==='string'?output.response:output?.result?.response;
   if(typeof reply!=='string'||!reply.trim())throw new Error('Empty companion model result');
   if(pref?.memory_enabled===1){for(const [role,content] of [['user',b.message],['assistant',reply]] as const){await env.DB.prepare('INSERT INTO holly_messages(id,owner_id,role,content,created_at) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),sub,role,content,now()).run();}
    await env.DB.prepare('DELETE FROM holly_messages WHERE owner_id=? AND id NOT IN (SELECT id FROM holly_messages WHERE owner_id=? ORDER BY created_at DESC LIMIT 40)').bind(sub,sub).run();}
   return json({reply,expression:expressionFromText(reply),style,syntheticEmotion:true,disclosure:'Holly is an AI companion; expressions are simulated.'});
  }catch(e){return fail(e);}
 }
 if(path==='/api/profiles'&&req.method==='GET'){
  const {results}=await env.DB.prepare('SELECT id,display_name,state,consent_recorded_at,created_at,revoked_at FROM voice_profiles WHERE owner_id=? ORDER BY created_at DESC').bind(sub).all();return json({profiles:results});
 }
 if(path==='/api/profiles/enroll'&&req.method==='POST'){
  const form=await req.formData();const name=form.get('displayName');const consent=form.get('consent');const statement=form.get('statement');const file=form.get('audio');
  if(!safeName(name)||consent!=='true'||statement!=='I authorize Interface to store this recording for my voice enrollment and understand that cloning requires verification.'||!(file instanceof File)||!validAudio(file))return jsonError('Name, explicit consent statement, and audio recording are required');
  const id=crypto.randomUUID(),key=`enrollments/${sub.replace(/[^a-zA-Z0-9_-]/g,'_')}/${id}`;
  await env.AUDIO.put(key,file.stream(),{httpMetadata:{contentType:fileType(file.type)},customMetadata:{owner:sub,kind:'voice-consent'}});
  await env.DB.prepare('INSERT INTO voice_profiles(id,owner_id,display_name,state,consent_version,consent_statement,consent_recorded_at,consent_audio_key,created_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,sub,name,'pending','v1',statement,now(),key,now()).run();
  await audit(env,sub,'voice.enrolled',id);return json({id,state:'pending',message:'Saved for manual identity and consent verification; no voice clone created.'},201);
 }
 const profile=path.match(/^\/api\/profiles\/([a-z0-9-]+)$/);
 if(profile&&req.method==='DELETE'){
  const row=await env.DB.prepare('SELECT consent_audio_key FROM voice_profiles WHERE id=? AND owner_id=?').bind(profile[1],sub).first<{consent_audio_key:string}>();
  if(!row)return jsonError('Not found',404);
  await env.DB.prepare("UPDATE voice_profiles SET state='revoked',revoked_at=? WHERE id=? AND owner_id=?").bind(now(),profile[1],sub).run();
  await env.AUDIO.delete(row.consent_audio_key);await audit(env,sub,'voice.revoked',profile[1]);return json({revoked:true});
 }
 const review=path.match(/^\/api\/admin\/profiles\/([a-z0-9-]+)\/verify$/);
 if(review&&req.method==='POST'){
  const secret=req.headers.get('x-admin-review-secret');if(!env.ADMIN_REVIEW_SECRET||env.ADMIN_REVIEW_SECRET.length<32||secret!==env.ADMIN_REVIEW_SECRET)return jsonError('Forbidden',403);
  const data=await req.json() as Record<string,unknown>;
  if(data.confirmed!==true||!validText(data.note,500))return jsonError('Explicit reviewer confirmation and verification note required');
  const res=await env.DB.prepare("UPDATE voice_profiles SET state='verified',verification_note=?,reviewed_at=?,reviewed_by=? WHERE id=? AND state='pending'").bind(data.note,now(),sub,review[1]).run();
  if(!res.meta.changes)return jsonError('Pending profile not found',404);await audit(env,sub,'voice.verified',review[1]);return json({state:'verified'});
 }
 if(path==='/api/clone/speak'&&req.method==='POST'){
  if(env.VOICE_CLONE_ENABLED!=='true'||!env.VOICE_CLONE_API_URL||!env.VOICE_CLONE_API_TOKEN)return jsonError('Voice cloning provider is not configured',501);
  const body=await req.json() as Record<string,unknown>;
  if(!validText(body.text,1200)||typeof body.profileId!=='string')return jsonError('Invalid request');
  const profile=await env.DB.prepare("SELECT id FROM voice_profiles WHERE id=? AND owner_id=? AND state='verified' AND revoked_at IS NULL").bind(body.profileId,sub).first();
  if(!profile)return jsonError('Only your verified, active voice profiles can synthesize speech',403);
  // Provider must independently authenticate accounts, support deletion and establish actual voice model provisioning.
  try{const u=new URL(env.VOICE_CLONE_API_URL);if(u.protocol!=='https:')return jsonError('HTTPS voice provider required',503);
   const output=await fetch(u.toString(),{method:'POST',headers:{authorization:`Bearer ${env.VOICE_CLONE_API_TOKEN}`,'content-type':'application/json'},body:JSON.stringify({profileId:body.profileId,text:body.text,ownerId:sub})});
   if(!output.ok)throw new Error(`Clone backend ${output.status}`);await audit(env,sub,'voice.synthesized',String(body.profileId));
   return new Response(output.body,{headers:{'content-type':output.headers.get('content-type')||'audio/mpeg','cache-control':'no-store','x-synthetic-voice':'true'}});
  }catch(e){return fail(e);}
 }
 if(path.startsWith('/api/'))return jsonError('Not found',404);
 return env.ASSETS.fetch(req);
}
export default {async fetch(req:Request,env:Env):Promise<Response>{
 const u=new URL(req.url);const origin=req.headers.get('Origin');const allowed=env.ALLOWED_ORIGIN||new URL(req.url).origin;
 const cors={'access-control-allow-origin':allowed,'vary':'Origin','access-control-allow-headers':'authorization,content-type,x-admin-review-secret','access-control-allow-methods':'GET,POST,PUT,DELETE,OPTIONS'};
 if(origin&&origin!==allowed)return jsonError('Origin not allowed',403);
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(!u.pathname.startsWith('/api/'))return env.ASSETS.fetch(req);
 if(u.pathname==='/api/health')return json({ok:true,version:'0.1.0'});
 const identity=await verifyBearer(req.headers.get('authorization'),env.AUTH_JWT_SECRET);
 if(!identity)return new Response(JSON.stringify({error:'Valid Interface Account bearer token required'}),{status:401,headers:{...cors,'content-type':'application/json'}});
 try{const res=await route(req,env,identity.sub,u.pathname);for(const [k,v] of Object.entries(cors))res.headers.set(k,v);return res;}catch(e){console.error('Request failed',e);return jsonError('Unable to complete request',500);}
}};
