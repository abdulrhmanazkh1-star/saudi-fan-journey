import {translationSchema,translateTexts} from './translate.ts';
import {config} from 'dotenv';
if(!process.env.NODE_TEST_CONTEXT)config({quiet:true});
import express from 'express';
import {aiStatus,refreshAIConfig,markAIVerified}from './ai-status.ts';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import path from 'node:path';
import {chatSchema,touristChat} from './chat.ts';
import {fileURLToPath} from 'node:url';
import {AdventureError,generateScene,requestSchema} from './adventure.ts';
export const app=express();
app.disable('x-powered-by');
const proxyHops=Number(process.env.TRUST_PROXY_HOPS||0);if(!Number.isInteger(proxyHops)||proxyHops<0||proxyHops>5)throw new Error('TRUST_PROXY_HOPS must be an integer from 0 to 5');if(proxyHops)app.set('trust proxy',proxyHops);
app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'","https://fonts.googleapis.com"],fontSrc:["'self'","https://fonts.gstatic.com"],imgSrc:["'self'","data:","blob:","https://images.unsplash.com"],connectSrc:["'self'","https://images.unsplash.com","https://fonts.googleapis.com","https://fonts.gstatic.com"],upgradeInsecureRequests:null}}}));
app.use(express.json({limit:'20kb'}));
app.get('/api/health',(_req,res)=>res.json(aiStatus()));
app.use(['/api/adventure','/api/chat','/api/ai','/api/translate'],(_req,_res,next)=>{refreshAIConfig();next();});
app.post('/api/ai/test',rateLimit({windowMs:60000,limit:3,standardHeaders:'draft-8',legacyHeaders:false,handler:(_req,res)=>res.status(429).json({error:'AI_RATE_LIMIT'})}),async(_req,res)=>{try{const reply=await touristChat({country:'JP',destination:'riyadh',language:'en',messages:[{role:'user',content:'Give a brief Saudi welcome in one sentence.'}]});markAIVerified();res.json({ok:true,model:reply.model,answer:reply.answer});}catch(e){res.status(e instanceof AdventureError?e.status:500).json({error:e instanceof AdventureError?e.message:'AI_FAILED'});}});
app.use('/api/adventure',rateLimit({windowMs:60000,limit:12,standardHeaders:'draft-8',legacyHeaders:false,handler:(_req,res)=>res.status(429).json({error:'Too many requests. Please wait a minute.',code:'RATE_LIMIT'})}));
app.post('/api/adventure/generate',async(req,res)=>{const input=requestSchema.safeParse(req.body);if(!input.success){res.status(400).json({error:'Invalid adventure request.',code:'INVALID_INPUT'});return;}try{const scene=await generateScene(input.data);markAIVerified();res.json(scene);}catch(e){const known=e instanceof AdventureError;res.status(known?e.status:500).json({error:known?e.message:'Unable to create the scene. Please retry.',code:'GENERATION_FAILED'});}});
app.use('/api/chat',rateLimit({windowMs:60000,limit:15,standardHeaders:'draft-8',legacyHeaders:false,handler:(_req,res)=>res.status(429).json({error:'RATE_LIMIT'})}));
app.post('/api/chat',async(req,res)=>{const parsed=chatSchema.safeParse(req.body);if(!parsed.success){res.status(400).json({error:'INVALID_INPUT'});return;}try{const reply=await touristChat(parsed.data);markAIVerified();res.json(reply);}catch(e){res.status(e instanceof AdventureError?e.status:500).json({error:e instanceof AdventureError?e.message:'AI_FAILED'});}});
app.post('/api/translate',rateLimit({windowMs:60000,limit:45,standardHeaders:'draft-8',legacyHeaders:false}),async(req,res)=>{const p=translationSchema.safeParse(req.body);if(!p.success){res.status(400).json({error:'INVALID_INPUT'});return;}try{res.json(await translateTexts(p.data));}catch(e){res.status(e instanceof AdventureError?e.status:500).json({error:e instanceof AdventureError?e.message:'TRANSLATION_FAILED'});}});
app.use('/api',(_req,res)=>{res.status(404).json({error:'API route not found.'});});
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');app.use(express.static(root));app.get('/{*path}',(_req,res)=>res.sendFile(path.join(root,'index.html')));
app.use((error:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{res.status(400).json({error:'Invalid or oversized JSON request.'});});
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT||3001);if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be between 1 and 65535');app.listen(port,'0.0.0.0',()=>console.log(`Saudi Fan Journey running on http://localhost:${port}`));}

