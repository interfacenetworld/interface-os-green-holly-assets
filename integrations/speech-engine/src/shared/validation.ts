export const LANGUAGES = ['en','es','fr','de','ja','zh','ar','hi','pt','it','ko','ru'] as const;
export type Language = typeof LANGUAGES[number];
export const isLanguage = (v: unknown): v is Language => typeof v==='string' && (LANGUAGES as readonly string[]).includes(v);
export const validText = (v: unknown, max=3000): v is string => typeof v==='string' && v.trim().length>0 && v.length<=max;
export const safeName = (v: unknown): v is string => typeof v==='string' && v.trim().length>=2 && v.trim().length<=80;
export const MAX_AUDIO_BYTES = 8_000_000;
export const ALLOWED_AUDIO_TYPES = ['audio/webm','audio/wav','audio/x-wav','audio/mpeg','audio/mp3','audio/ogg','audio/mp4'];
export function fileType(type: string) {return type.split(';')[0].toLowerCase().trim();}
export function validAudio(file: {type:string,size:number}) {return ALLOWED_AUDIO_TYPES.includes(fileType(file.type)) && file.size>0 && file.size<=MAX_AUDIO_BYTES;}
export function jsonError(message:string,status=400){return new Response(JSON.stringify({error:message}),{status,headers:{'content-type':'application/json; charset=utf-8'}});}
