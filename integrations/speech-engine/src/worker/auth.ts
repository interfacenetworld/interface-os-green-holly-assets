export type Identity={sub:string;exp:number;scope?:string};
const encoder=new TextEncoder();
function unbase64url(v:string) {const x=v.replace(/-/g,'+').replace(/_/g,'/');const raw=atob(x+'='.repeat((4-x.length%4)%4));return Uint8Array.from(raw,c=>c.charCodeAt(0));}
function b64url(v:Uint8Array):string {let s='';for(const x of v)s+=String.fromCharCode(x);return btoa(s).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');}
// HMAC JWT validation for Interface Account gateway's HS256 tokens. No unsigned/alg:none tokens.
export async function verifyBearer(header:string|null,secret:string|undefined):Promise<Identity|null>{
 if(!header?.startsWith('Bearer ')||!secret||secret.length<32)return null;
 const jwt=header.slice(7);const parts=jwt.split('.');if(parts.length!==3)return null;
 try{
  const head=JSON.parse(new TextDecoder().decode(unbase64url(parts[0])));
  if(head.alg!=='HS256'||head.typ!=='JWT')return null;
  const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  if(!await crypto.subtle.verify('HMAC',key,unbase64url(parts[2]),encoder.encode(parts[0]+'.'+parts[1])))return null;
  const payload=JSON.parse(new TextDecoder().decode(unbase64url(parts[1])));
  if(typeof payload.sub!=='string'||!payload.sub||typeof payload.exp!=='number'||payload.exp<=Date.now()/1000)return null;
  if(payload.nbf&&payload.nbf>Date.now()/1000)return null;
  return {sub:payload.sub,exp:payload.exp,scope:payload.scope};
 }catch{return null;}
}
export async function signLocalToken(sub:string,secret:string,ttlSeconds=3600){
 const enc=(o:object)=>b64url(encoder.encode(JSON.stringify(o)));
 const msg=enc({alg:'HS256',typ:'JWT'})+'.'+enc({sub,exp:Math.floor(Date.now()/1000)+ttlSeconds});
 const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signature=await crypto.subtle.sign('HMAC',key,encoder.encode(msg));return msg+'.'+b64url(new Uint8Array(signature));
}
