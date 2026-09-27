// 鲸鱼娘改编专用导出器：原入口不变；按素材哈希隔离帧缓存，可安全续渲。
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {createHash}=require('node:crypto'),{spawnSync}=require('node:child_process');
const sharp=require('sharp'),{chromium}=require('playwright');
const {chromeOptions,ffmpeg,ffprobe}=require('./tools/runtime.cjs');
const root=__dirname,docs=path.join(root,'out/video');
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,v]=a.replace(/^--/,'').split('=');return[k,v??true];}));
const runStarted=performance.now(),startedAt=new Date().toISOString(),angle=args.angle||(args.verify?'d3d11':'vulkan');
if(!['d3d11','vulkan'].includes(angle))throw new Error('angle 须为 d3d11 或 vulkan');
args.angle=angle;
args.isolated=!args.shared;
if(args.verify&&!args.lang)args.lang='en';
const variant=angle==='d3d11'?'':'-'+angle;
const audit=path.join(docs,(args.verify?'regression-audit':args.annotated?'full-audit-annotated':args.lang==='en'?'full-audit':'full-audit-zh-en')+variant);
const hash=b=>createHash('sha256').update(b).digest('hex'),assert=(ok,m)=>{if(!ok)throw new Error(m);};
const workerCount=Number(args.workers||(angle==='vulkan'?6:3));
assert(Number.isInteger(workerCount)&&workerCount>=1&&workerCount<=12,'workers 须为 1–12 的整数');
const enumerate=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?enumerate(path.join(dir,e.name)):[path.join(dir,e.name)]);
const entryName=args.annotated?'studio-whale-annotated.html':'studio-whale.html',entry=path.join(root,entryName);
const sources=[entry,...[...fs.readFileSync(entry,'utf8').matchAll(/<script[^>]+src="([^"]+)"/g)].map(m=>path.join(root,m[1])),path.join(root,'assets/fonts/ZCOOLKuaiLe-Regular.ttf'),...enumerate(path.join(root,'assets/whale')).filter(f=>f.endsWith('.png'))];
const fingerprint=hash(Buffer.from((variant?'angle='+angle+'\n':'')+'lang='+(args.lang||'zh-CN')+'\n'+sources.sort().map(f=>path.relative(root,f)+':'+hash(fs.readFileSync(f))).join('\n')));
const frameDir=path.join(root,'out/whale-final',fingerprint.slice(0,12)+(args.fresh?'-fresh-'+Date.now():''),'frames'),fps=24,duration=156.6,count=Math.ceil(fps*duration);
fs.mkdirSync(audit,{recursive:true});
const errors=[];
// 所有调用均使用 -v error；部分损坏码流会打印错误但仍返回 0，不能只检查退出码。
const run=(cmd,a)=>{const r=spawnSync(cmd,a,{encoding:'utf8',windowsHide:true});assert(r.status===0&&!r.stderr.trim(),r.stderr||cmd+' failed');return r.stdout;};
(async()=>{
 const launch=()=>chromium.launch({headless:true,...chromeOptions(args.chrome),args:['--allow-file-access-from-files','--ignore-gpu-blocklist','--use-angle='+angle,'--enable-gpu-rasterization','--disable-renderer-backgrounding','--disable-background-timer-throttling',...(args.unthrottled?['--disable-frame-rate-limit','--disable-gpu-vsync']:[])]});
 const browser=await launch(),isolated=new Set();
 const open=async(entry=entryName,lang=args.lang||'zh-CN')=>{const owner=args.isolated?await launch():browser;if(args.isolated)isolated.add(owner);const page=await owner.newPage({viewport:{width:1920,height:1080}});if(args.isolated){const close=page.close.bind(page);page.close=async()=>{try{await close();}finally{await owner.close();isolated.delete(owner);}};}page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.join(root,entry)).href+'?render&lang='+lang);await page.waitForFunction(()=>window.ready&&(window.WHALE_FULL?window.whaleReady:true),null,{timeout:60000});return page;};
 const render=async(page,t,type='image/png')=>{const data=await page.evaluate(async({t,type})=>{const data=await window.renderAt(t,type,.95);const calls=window.whaleFull?.calls||[];if(calls.some(c=>![c.x,c.y,c.u,c.pose.s,c.pose.rot].every(Number.isFinite)))throw new Error('Non-finite character transform at '+t);return {data,calls: calls.length,special:window.whaleFull?.special||[],approved:window.whaleCheck?.calls?.length||0,timings:window.whaleTimings};},{t,type});return {...data,buffer:Buffer.from(data.data.split(',')[1],'base64')};};
 try{
  if(args.benchmark){await require('./render_whale_benchmark.cjs')({args,open,render,root,frameDir,fingerprint,errors});return;}
  if(args['check-localization']){await require('./verify_whale_localization.cjs')({open,render,docs,fingerprint,errors});return;}
  if(args['check-annotations']){assert(args.annotated,'注释检查须加 --annotated');await require('./verify_whale_annotations.cjs')({open,render,docs,fingerprint,errors});return;}
  const probe=await open();
  const gpu=await probe.evaluate(()=>gpuInfo());
  assert(gpu.toLowerCase().includes(angle==='vulkan'?'vulkan':'direct3d11'),'图形后端未按请求启动：'+gpu);
  const chapters=await probe.evaluate(()=>CH.map(c=>({name:c.name,start:c.start,end:Math.min(c.end,156.6),shots:c.shots.map((s,i)=>({start:s[0],end:i+1<c.shots.length?c.shots[i+1][0]:Math.min(c.end,156.6),name:s[1].name}))})));
  fs.writeFileSync(path.join(audit,'shots.json'),JSON.stringify(chapters,null,2));
  if(args.sheet){
   const times=String(args.sheet).split(',').map(Number),cols=Number(args.cols||3),w=Number(args.w||640),h=Math.round(w*9/16),tiles=[];
   for(const [i,t]of times.entries()){const r=await render(probe,t);fs.writeFileSync(path.join(audit,'t'+t+'.png'),r.buffer);const label=Buffer.from('<svg width="'+w+'" height="'+h+'"><rect width="130" height="28" fill="#202234"/><text x="8" y="21" font-family="sans-serif" font-size="18" fill="white">'+t.toFixed(3)+'s</text></svg>');tiles.push({input:await sharp(r.buffer).resize(w,h).composite([{input:label}]).png().toBuffer(),left:(i%cols)*w,top:Math.floor(i/cols)*h});}
   await sharp({create:{width:cols*w,height:Math.ceil(times.length/cols)*h,channels:3,background:'#ddd'}}).composite(tiles).png().toFile(path.resolve(root,args.out||'out/video/detail.png'));console.log('Sheet rendered');return;
  }
  if(args.audit){
   const observations=[];
   for(const chapter of chapters){
    const tiles=[];for(const [i,shot]of chapter.shots.entries()){
     const times=args.audit==='boundaries'?[shot.start+.04,Math.max(shot.start+.06,shot.end-.045)]:[(shot.start+shot.end)/2];
     for(const [j,t]of times.entries()){
      const r=await render(probe,t),filename=chapter.name+'-'+args.audit+'-'+i+'-'+j+'.png';fs.writeFileSync(path.join(audit,filename),r.buffer);
      observations.push({chapter:chapter.name,shot:shot.name,time:t,calls:r.calls,approved:r.approved,special:r.special,file:filename});
      const index=i*times.length+j,label=Buffer.from('<svg width="480" height="270"><rect width="185" height="26" fill="#202234"/><text x="7" y="19" font-family="sans-serif" font-size="16" fill="white">'+t.toFixed(2)+' '+shot.name+'</text></svg>');
      tiles.push({input:await sharp(r.buffer).resize(480,270).composite([{input:label}]).png().toBuffer(),left:(index%3)*480,top:Math.floor(index/3)*270});
     }
    }
    await sharp({create:{width:1440,height:Math.ceil(tiles.length/3)*270,channels:3,background:'#ddd'}}).composite(tiles).png().toFile(path.join(audit,chapter.name+'-'+args.audit+'.png'));
    console.log('Audited '+chapter.name+' ('+chapter.shots.length+' shots)');
   }
   assert(!errors.length,errors.join('\n'));fs.writeFileSync(path.join(audit,'observations-'+args.audit+'.json'),JSON.stringify({fingerprint,errors,observations},null,2));return;
  }
  if(args.verify){
   const results={fingerprint,errors,deterministic:[],special:[],fps,duration};
   const times=[.8,2.8,8.5,18.8,23.8,31.8,39.4,55.7,59.9,74,89.8,103.2,106.5,110.9,116.5,118,128.9,131.5,135.44,136.2,139,151];
   for(const t of times){const a=await render(probe,t);await render(probe,Math.max(0,t-.67));const b=await render(probe,t);assert(hash(a.buffer)===hash(b.buffer),'随机顺序不一致 '+t);results.deterministic.push(t);results.special.push(...a.special);}
   const fast=await probe.evaluate(()=>{let samples=0,unreachable=0,maxGroundError=0;for(let t=OFF+62*BEAT;t<44.38;t+=1/1000){const p=whaleCheck.runPose(t,true);for(const c of p.contacts){samples++;if(!c.reachable)unreachable++;if(c.stance)maxGroundError=Math.max(maxGroundError,Math.abs(c.worldFoot[1]-834));}}return{samples,unreachable,maxGroundError};});
   assert(!fast.unreachable&&fast.maxGroundError===0,'高速跑步支撑异常');results.fastRun=fast;
   const fixture=await open();
   await fixture.evaluate(()=>{window.twoActors=false;drawWorld=()=>{whaleFull.draw(550,950,60,{hat:'crown',aL:1.2});if(window.twoActors)whaleFull.draw(1380,950,60,{hat:'party',aR:.8});};});
   const single=await render(fixture,2);await fixture.evaluate(()=>window.twoActors=true);const pair=await render(fixture,2);
   const leftCrop={left:180,top:100,width:740,height:940};
   assert(hash(await sharp(single.buffer).extract(leftCrop).raw().toBuffer())===hash(await sharp(pair.buffer).extract(leftCrop).raw().toBuffer()),'同帧第二个演员覆盖第一个演员');
   assert(hash(single.buffer)!==hash(pair.buffer),'第二个演员没有绘制');results.multiActorIsolation=true;await fixture.close();
   const ui=await browser.newPage({viewport:{width:1440,height:1080}});ui.on('pageerror',e=>errors.push(e.message));
   await ui.goto(pathToFileURL(path.join(root,'studio-whale.html')).href);await ui.waitForFunction(()=>window.whaleReady&&document.getElementById('tt').textContent.includes('秒'),{timeout:60000});
   results.ui=[];for(let i=0;i<9;i++){await ui.locator('#shot').selectOption(String(i));await ui.waitForFunction(()=>document.getElementById('tt').textContent==='原片 '+Number(document.getElementById('scrub').value).toFixed(2)+' 秒');await ui.locator('#scrub').focus();await ui.keyboard.press('ArrowRight');await ui.waitForFunction(()=>document.getElementById('tt').textContent==='原片 '+Number(document.getElementById('scrub').value).toFixed(2)+' 秒');results.ui.push(i);}
   await ui.keyboard.press('End');await ui.waitForFunction(()=>document.getElementById('tt').textContent==='原片 '+Number(document.getElementById('scrub').max).toFixed(2)+' 秒');
   const end=await ui.evaluate(()=>({t:T,chapter:CH.find(c=>T>=c.start&&T<c.end)?.name}));assert(end.t<duration&&end.chapter==='finale','时间滑块末尾进入空镜头');results.uiEnd=end;
   await ui.screenshot({path:path.join(audit,'studio-ui.png'),fullPage:true});await ui.close();
   assert(!errors.length,errors.join('\n'));fs.writeFileSync(path.join(audit,'validation.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));return;
  }
  await probe.close();
  fs.mkdirSync(frameDir,{recursive:true});
  const first=args.range?Math.round(Number(String(args.range).split(':')[0])*fps):0,last=args.range?Math.min(count,Math.ceil(Number(String(args.range).split(':')[1])*fps)):count;
  const todo=[];for(let i=first;i<last;i++){const f=path.join(frameDir,'f'+String(i).padStart(5,'0')+'.jpg');if(!fs.existsSync(f)||fs.statSync(f).size<1000)todo.push(i);}
  console.log('Rendering '+todo.length+' missing frames; fingerprint '+fingerprint.slice(0,12));
  let next=0,done=0;const started=Date.now();
  await Promise.all(Array.from({length:Math.min(todo.length,workerCount)},async()=>{const page=await open();try{while(next<todo.length){const i=todo[next++],r=await render(page,i/fps,'image/jpeg'),f=path.join(frameDir,'f'+String(i).padStart(5,'0')+'.jpg');fs.writeFileSync(f+'.tmp',r.buffer);fs.renameSync(f+'.tmp',f);done++;if(done%48===0||done===todo.length)console.log('Frames '+done+'/'+todo.length+'; '+Math.round((Date.now()-started)/Math.max(1,done))+' ms/frame; ETA '+((todo.length-done)*(Date.now()-started)/Math.max(1,done)/60000).toFixed(1)+' min');}}finally{await page.close();}}));
  assert(!errors.length,errors.join('\n'));
  if(args.range)return;
  const renderMs=Date.now()-started,encodingStarted=performance.now();
  for(let i=0;i<count;i++)assert(fs.existsSync(path.join(frameDir,'f'+String(i).padStart(5,'0')+'.jpg')),'Missing frame '+i);
  const output=path.join(docs,(args.annotated?'pdoom-whale-annotated':args.lang==='en'?'pdoom-whale-final':'pdoom-whale-zh-en')+variant+'.mp4');
  // 视频和音频分别结束：全局 -t 会取整丢帧，而同次 -frames:v 又可能提前终止音频输入。
  const silent=path.join(path.dirname(frameDir),'video-crf17-filter1.mp4');
  if(!fs.existsSync(silent)){
    const temporary=silent.replace('.mp4','.tmp.mp4');
    run(ffmpeg,['-y','-v','error','-xerror','-filter_threads','1','-framerate',String(fps),'-i',path.join(frameDir,'f%05d.jpg'),'-frames:v',String(count),'-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-an',temporary]);
    fs.renameSync(temporary,silent);
  }
  const silentInfo=JSON.parse(run(ffprobe,['-v','error','-show_streams','-of','json',silent])).streams[0];
  assert(Number(silentInfo.nb_frames)===count&&silentInfo.width===1920&&silentInfo.height===1080,'视频缓存规格不符');
  const encodeMs=performance.now()-encodingStarted,muxStarted=performance.now();
  const pendingOutput=path.join(path.dirname(frameDir),'validated-output.tmp.mp4');
  run(ffmpeg,['-y','-v','error','-xerror','-i',silent,'-t',String(duration),'-i',path.join(root,'assets/pdoom.mp3'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',pendingOutput]);
  const muxMs=performance.now()-muxStarted,outputReadyMs=performance.now()-runStarted,validationStarted=performance.now();
  run(ffmpeg,['-v','error','-xerror','-i',pendingOutput,'-f','null','-']);
  const media=JSON.parse(run(ffprobe,['-v','error','-show_streams','-show_format','-of','json',pendingOutput]));
  const v=media.streams.find(s=>s.codec_type==='video'),a=media.streams.find(s=>s.codec_type==='audio');
  assert(v.width===1920&&v.height===1080&&v.r_frame_rate==='24/1'&&Number(v.nb_frames)===count,'视频规格不符');assert(a&&Math.abs(Number(a.duration)-duration)<.05,'音频时长不符');
  fs.renameSync(pendingOutput,output);media.format.filename=output;
  const report={fingerprint,output,frameDir,frameCount:count,fps,duration,decodeVerified:true,strictDecodeErrors:true,filterThreads:1,pageErrors:errors,sha256:hash(fs.readFileSync(output)),media,angle,gpu,annotated:!!args.annotated,workers:workerCount,startedAt,timing:{freshFrames:todo.length,renderMs,encodeMs,muxMs,outputReadyMs,validationMs:performance.now()-validationStarted,totalMs:performance.now()-runStarted}};
  fs.writeFileSync(path.join(audit,'export.json'),JSON.stringify(report,null,2));console.log('Export complete: '+output);
 }finally{await Promise.all([...isolated].map(b=>b.close()));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
