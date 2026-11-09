import {providerConfig} from './provider.ts';
import fs from 'node:fs';import path from 'node:path';import {parse}from'dotenv';import {createHash}from'node:crypto';
const fields=['AI_PROVIDER','GROQ_API_KEY','GROQ_MODEL','OPENROUTER_API_KEY','OPENROUTER_MODEL'];const inherited=Object.fromEntries(fields.map(k=>[k,process.env[k]]));let verified:{fingerprint:string;at:string}|null=null;
export function refreshAIConfig(){if(process.env.NODE_ENV!=='production'&&!process.env.NODE_TEST_CONTEXT){try{const env=parse(fs.readFileSync(path.resolve('.env')));for(const field of fields)process.env[field]=env[field]?.trim()||inherited[field]||'';}catch{}}}
function fingerprint(){return createHash('sha256').update(JSON.stringify(providerConfig())).digest('hex');}
export function markAIVerified(){verified={fingerprint:fingerprint(),at:new Date().toISOString()};}
export function aiStatus(){refreshAIConfig();const {key,model,valid,provider}=providerConfig();const configured=!!key&&valid;const success=configured&&verified?.fingerprint===fingerprint();return{ok:true,configured,verified:!!success,verifiedAt:success?verified!.at:null,status:!key?'missing_key':!model?'missing_model':!valid?'invalid_model':success?'verified':'ready_not_tested',provider,model:valid?model:null};}
