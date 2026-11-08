import express from 'express';
import multer from 'multer';
import {mkdtemp,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
const app=express(),root=await mkdtemp(path.join(tmpdir(),'ember-media-'));
const upload=multer({dest:root,limits:{fileSize:2*1024**3,files:1}});
let busy=false;
app.post('/api/transcode',upload.single('media'),async(req,res)=>{
 if(!req.file)return res.status(400).json({error:'Select a media file.'});
 const audio=/\.(mp3|wav|ogg|m4a|aac|flac|opus|wma|aiff|aif|amr|m4b)$/i.test(req.file.originalname);
 const source=req.file.path,dest=source+(audio?'.m4a':'.mp4');
 if(busy){await rm(source,{force:true});return res.status(429).json({error:'A conversion is already running. Please try again shortly.'})}
 busy=true;
 try{
 await access(ffmpeg);
 await new Promise((resolve,reject)=>{
 const child=spawn(ffmpeg,['-nostdin','-v','error','-protocol_whitelist','file,pipe,crypto,data','-i',source,...(audio?['-vn','-map','0:a:0']:['-map','0:v:0','-map','0:a:0?','-c:v','libx264','-preset','veryfast','-crf','23','-pix_fmt','yuv420p','-vf','scale=trunc(iw/2)*2:trunc(ih/2)*2']),'-c:a','aac','-movflags','+faststart',dest]);
 let stderr='';child.stderr.on('data',d=>stderr=(stderr+d).slice(-4000));const timer=setTimeout(()=>{child.kill('SIGKILL');reject(Error('Conversion exceeded 10 minutes.'))},600000);
 child.on('error',e=>{clearTimeout(timer);reject(e)});child.on('close',code=>{clearTimeout(timer);code===0?resolve():reject(Error(stderr||'Unsupported or damaged media.'))});
 });
 res.type(audio?'audio/mp4':'video/mp4');res.sendFile(dest,async()=>{await Promise.all([rm(source,{force:true}),rm(dest,{force:true})]);busy=false});
 }catch(e){busy=false;await Promise.all([rm(source,{force:true}),rm(dest,{force:true})]);res.status(422).json({error:e.code==='ENOENT'?'FFmpeg is not installed. Run npm run setup:ffmpeg.':e.message})}
});
app.use((err,req,res,next)=>res.status(400).json({error:err.message}));
const port=Number(process.env.PORT||5174);
const server=app.listen(port,'127.0.0.1',()=>console.log(`Local conversion service: http://127.0.0.1:${port}`));
process.on('SIGINT',()=>server.close(async()=>{await rm(root,{recursive:true,force:true});process.exit()}));
