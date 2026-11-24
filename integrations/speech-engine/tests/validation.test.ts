import {describe,it,expect} from 'vitest';
import {validText,isLanguage,validAudio,fileType} from '../src/shared/validation';
describe('API input validation',()=>{
 it('accepts supported language codes',()=>{expect(isLanguage('en')).toBe(true);expect(isLanguage('xx')).toBe(false)});
 it('rejects blank or oversized script',()=>{expect(validText('  ')).toBe(false);expect(validText('hi')).toBe(true);expect(validText('a'.repeat(3001))).toBe(false)});
 it('enforces audio file type and size',()=>{expect(validAudio({type:'audio/webm;codecs=opus',size:1000})).toBe(true);expect(validAudio({type:'text/plain',size:12})).toBe(false);expect(validAudio({type:'audio/wav',size:9_000_000})).toBe(false);expect(fileType('audio/mp4; codecs=mp4a')).toBe('audio/mp4')});
});
