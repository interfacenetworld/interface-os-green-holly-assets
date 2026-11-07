'use strict';
const $=id=>document.getElementById(id);
const prefix='../assets/';
const images={character:'09_Holly_Character/holly-full-body-main.png',sphere:'12_Speaking_Light/sphere-hero.png',companion:'10_Holly_Modes/companion-mode.png',creator:'10_Holly_Modes/creator-mode.png'};
let cam=null,mic=null;
$('holly').addEventListener('error',()=>{$('holly').hidden=true;$('fallback').hidden=false});
function picture(path){$('fallback').hidden=true;$('holly').hidden=false;$('holly').src=prefix+path}
function log(message){$('log').textContent+='\n'+message;$('log').scrollTop=$('log').scrollHeight}
function mode(name){if(!Object.hasOwn(images,name))return;picture(images[name]);$('mode-label').textContent=({character:'Character Form',sphere:'Speaking Light Sphere',companion:'Companion Mode',creator:'Creator Mode'})[name];$('state').textContent=$('mode-label').textContent;$('expression').textContent='Neutral · idle';document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===name)));log('Holly: '+$('mode-label').textContent+' activated (UI preview).')}
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.mode)));
document.querySelectorAll('[data-face]').forEach(b=>b.addEventListener('click',()=>{$('expression').textContent=b.dataset.face+' · preview';picture('09_Holly_Character/face-'+b.dataset.face+'.png')}));
$('summon').addEventListener('click',()=>mode('sphere'));
$('motion').addEventListener('click',()=>{const paused=$('stage').dataset.paused==='true';$('stage').dataset.paused=String(!paused);$('motion').textContent=paused?'Pause motion':'Resume motion'});
$('reset').addEventListener('click',()=>{mode('character');$('stage').dataset.paused='false';$('motion').textContent='Pause motion'});
$('chat').addEventListener('submit',e=>{e.preventDefault();const value=$('message').value.trim();if(!value)return;log('You: '+value);log('Holly (demo): Message received. A secure Holly Conversation service must be connected to generate an AI response.');$('message').value=''});
function update(){const c=!!cam?.getVideoTracks().some(t=>t.readyState==='live');const m=!!mic?.getAudioTracks().some(t=>t.readyState==='live');$('camera').textContent=c?'Stop camera':'Start camera';$('mic').textContent=m?'Stop microphone':'Start microphone';$('preview').hidden=!c;$('media-status').textContent='Camera '+(c?'active':'off')+' · Microphone '+(m?'active':'off')}
async function camera(){if(cam){cam.getTracks().forEach(t=>t.stop());cam=null;$('preview').srcObject=null;update();return}try{if(!navigator.mediaDevices?.getUserMedia)throw Error('HTTPS or localhost required');cam=await navigator.mediaDevices.getUserMedia({video:true,audio:false});$('preview').srcObject=cam;cam.getTracks().forEach(t=>t.onended=()=>{cam=null;update()});update()}catch(e){$('media-status').textContent='Camera: '+e.message}}
async function microphone(){if(mic){mic.getTracks().forEach(t=>t.stop());mic=null;update();return}try{if(!navigator.mediaDevices?.getUserMedia)throw Error('HTTPS or localhost required');mic=await navigator.mediaDevices.getUserMedia({audio:true,video:false});mic.getTracks().forEach(t=>t.onended=()=>{mic=null;update()});update()}catch(e){$('media-status').textContent='Microphone: '+e.message}}
function stop(){if(cam){cam.getTracks().forEach(t=>t.stop());cam=null}if(mic){mic.getTracks().forEach(t=>t.stop());mic=null}$('preview').srcObject=null;update()}
$('camera').addEventListener('click',camera);$('mic').addEventListener('click',microphone);$('stop').addEventListener('click',stop);window.addEventListener('pagehide',stop);update();