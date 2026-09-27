// 复用正式导出器的浏览器、绘帧和 JPEG 参数；测速结果与临时帧均写到 out/。
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createHash}=require('node:crypto');
const sharp=require('sharp');
const hash=b=>createHash('sha256').update(b).digest('hex');
const cpu=()=>os.cpus().reduce((a,c)=>{a.idle+=c.times.idle;a.total+=Object.values(c.times).reduce((p,q)=>p+q,0);return a;},{idle:0,total:0});
module.exports=async({args,open,render,root,frameDir,fingerprint,errors})=>{
 if(args.reference)frameDir=path.resolve(root,String(args.reference));
 const groups=String(args.benchmark===true?'1,3,6,3':args.benchmark).split(',').map(Number);
 if(groups.some(n=>!Number.isInteger(n)||n<1||n>12))throw new Error('benchmark 并发数须为 1–12 的整数');
 const times=[.8,3.7,13.6,20.5,23.8,27.1,31.8,39.4,43,49.5,55.7,59.9,61.5,64,67.5,71.5,74,79,83,89.8,97.7,100,103.2,106.5,110.9,116.5,118,120,122,126.5,128.9,131.5,135.44,139,145,154].map(t=>Math.round(t*24));
 const folder=path.join(root,'out/whale-benchmark',String(Date.now()));fs.mkdirSync(folder,{recursive:true});
 const report={fingerprint,referenceFrameDir:frameDir,createdAt:new Date().toISOString(),options:{isolated:!!args.isolated,unthrottled:!!args.unthrottled,angle:args.angle||'d3d11',reportDifferences:!!args['report-differences']},cpu:os.cpus()[0].model,threads:os.cpus().length,totalRAM:os.totalmem(),frameIndices:times,quality:'1920x1080, JPEG .95, '+(args.angle||'d3d11'),groups:[],pageErrors:errors};
 const references=new Map();
 for(const workers of groups){
  const pages=[],frames=[],started=performance.now();let minFree=os.freemem();
  if(minFree<2*1024**3)throw new Error('可用内存不足 2 GiB，停止增加负载');
  try{
   for(let i=0;i<workers;i++){
    pages.push(await open());
    await pages[i].evaluate(()=>{
     window.whaleTimings={};let started=0;const oldRender=window.renderAt,oldComposite=composite,oldURL=outC.toDataURL.bind(outC);
     window.renderAt=async(...args)=>{started=performance.now();return oldRender(...args);};
     composite=t=>{const s=performance.now();const r=oldComposite(t);whaleTimings.composite=performance.now()-s;return r;};
     outC.toDataURL=(...args)=>{const s=performance.now();whaleTimings.beforeReadback=s-started;const r=oldURL(...args);whaleTimings.jpeg=performance.now()-s;return r;};
    });
   }
   await Promise.all(pages.map(p=>render(p,3.7,'image/jpeg')));
   const startupMs=performance.now()-started,startCPU=cpu(),start=performance.now();let next=0;
   const sampler=setInterval(()=>{minFree=Math.min(minFree,os.freemem());},250);
   try{await Promise.all(pages.map(async page=>{
    while(next<times.length){
     const index=times[next++],s=performance.now(),r=await render(page,index/24,'image/jpeg'),renderMs=performance.now()-s;
     const digest=hash(r.buffer),cached=path.join(frameDir,'f'+String(index).padStart(5,'0')+'.jpg');
     const reference=references.get(index)||(fs.existsSync(cached)?fs.readFileSync(cached):r.buffer),expected=hash(reference);
     let comparison={exact:digest===expected};
     if(!comparison.exact){
      const [a,b]=await Promise.all([sharp(r.buffer).raw().toBuffer(),sharp(reference).raw().toBuffer()]);let changed=0,total=0,max=0;
      for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);if(d)changed++;total+=d;max=Math.max(max,d);}
      comparison={exact:false,changedChannels:changed,changedFraction:changed/a.length,mae:total/a.length,max};
      // 单进程重绘旧帧也存在局部 GPU/JPEG 最低有效位差异；显式限定容差并写入报告。
      comparison.withinExactBackendTolerance=comparison.mae<=.002&&comparison.changedFraction<=.001&&max<=16;
      if(!comparison.withinExactBackendTolerance){fs.writeFileSync(path.join(folder,'mismatch-'+index+'.jpg'),r.buffer);if(!args['report-differences'])throw new Error('绘帧差异超出容差：'+index+'/24 '+JSON.stringify(comparison)+'；见 '+folder);}
     }
     references.set(index,reference);
     const ioStart=performance.now(),target=path.join(folder,'f'+index+'.jpg');fs.writeFileSync(target+'.tmp',r.buffer);fs.renameSync(target+'.tmp',target);
     frames.push({index,renderMs,ioMs:performance.now()-ioStart,...r.timings,sha256:digest,comparison,approvedCache:fs.existsSync(cached)});
    }
   }));}finally{clearInterval(sampler);}
   const elapsedMs=performance.now()-start,endCPU=cpu();
   const result={workers,frames:frames.length,startupMs,elapsedMs,fps:frames.length*1000/elapsedMs,systemCPU:1-(endCPU.idle-startCPU.idle)/(endCPU.total-startCPU.total),minFreeGiB:minFree/1024**3,meanMs:Object.fromEntries(['beforeReadback','composite','jpeg','renderMs','ioMs'].map(k=>[k,frames.reduce((s,f)=>s+f[k],0)/frames.length])),samples:frames};
   report.groups.push(result);fs.writeFileSync(path.join(folder,'results.json'),JSON.stringify(report,null,2));
   console.log(JSON.stringify({...result,samples:undefined}));
  }finally{await Promise.all(pages.map(p=>p.close()));}
 }
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('Benchmark report: '+path.join(folder,'results.json'));
};
