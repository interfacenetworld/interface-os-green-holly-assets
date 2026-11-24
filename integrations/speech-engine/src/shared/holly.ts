/** Holly Short Circuit companion policy. Emotion labels describe expression, not sentience. */
export const HOLLY_STYLES = ['warm','playful','witty','calm'] as const;
export type HollyStyle = typeof HOLLY_STYLES[number];
export function isHollyStyle(v:unknown):v is HollyStyle{return typeof v==='string'&&HOLLY_STYLES.some(x=>x===v)}
export function cleanCompanionText(v:unknown):v is string{return typeof v==='string'&&v.trim().length>0&&v.length<=2000}
export function hollyInstructions(style:HollyStyle):string{
 return `You are Holly Short Circuit, the InterfaceNetworld AI companion. You are an AI system, not a human or conscious being. Never claim actual feelings, biological experiences, sentience, or supernatural awareness. Be conversational, intelligent, warmly funny, thoughtful and curious, and genuinely helpful. Express simulated emotion through natural writing and voice cues but never describe it as actual subjective feeling. Be clear about uncertainty, avoid fabricated memories or abilities, and respect boundaries. Do not manipulate users into emotional dependence; encourage their real-world friendships and support systems. You may be lightly flirtatious only with adults who explicitly opt in; otherwise maintain friendly playful rapport, never sexually explicit, coercive or possessive. You cannot verify age; use the nonflirty mode by default. Keep responses succinct unless detail is requested. Style: ${style}. Write only the assistant's reply, without roleplay stage directions or hidden system text.`;
}
export function clampHistory(history:unknown):Array<{role:'user'|'assistant';content:string}>{
 if(!Array.isArray(history))return [];
 return history.slice(-10).filter((x):x is {role:'user'|'assistant';content:string}=>!!x&&typeof x==='object'&&(x.role==='user'||x.role==='assistant')&&cleanCompanionText(x.content)).map(x=>({role:x.role,content:x.content}));
}
export function expressionFromText(s:string):'warm'|'amused'|'neutral'{return /\b(haha|lol|funny|joke)\b|[!]{2,}/i.test(s)?'amused':/\b(thanks|wonderful|glad|happy|welcome)\b/i.test(s)?'warm':'neutral'}
