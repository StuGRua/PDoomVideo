const fs=require('node:fs'),path=require('node:path'),{createHash}=require('node:crypto');
const sharp=require('sharp');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);},hash=b=>createHash('sha256').update(b).digest('hex');
module.exports=async({open,render,docs,fingerprint,errors})=>{
 const dir=path.join(docs,'annotation-review');fs.mkdirSync(dir,{recursive:true});
 const page=await open(),report={fingerprint,cues:[],boundaryChecks:[],errors};const tiles=[];
 try{
  const notes=await page.evaluate(()=>WHALE_TERMS);
  const expected=['agi','chinese-room','shoggoth','shinigami','sydney','basilisk','omega-point','mlp','von-neumann','sharp-left-turn','cdr','gato','paperclips','orthogonality','chinchilla','rlhf','loom','ilya'];
  assert(JSON.stringify(notes.map(n=>n.id))===JSON.stringify(expected),'应包含 18 项已确认注释，按时间排列且不重复');
  for(const [i,n]of notes.entries()){
   assert(n.start<n.end&&n.start>=0&&n.end<=156.6,'注释时间非法');if(i)assert(n.start>=notes[i-1].end,'注释时间重叠');
   for(const [j,t]of [n.start+.03,n.sample,n.end-.03].entries()){
    await page.evaluate(()=>whaleAnnotations.enabled=true);const a=await render(page,t),active=await page.evaluate(()=>whaleAnnotations.active);
    assert(active?.id===n.id,'注释未按时间出现：'+n.id);assert(active.x>=24&&active.y>=24&&active.x+active.width<=1896&&active.y+active.height<974,'注释越界或进入字幕区');
    assert(active.textWidth+24<active.width&&active.titleWidth+42<active.width,'注释文本越出卡片');
    await page.evaluate(()=>whaleAnnotations.enabled=false);const b=await render(page,t);
    const [on,off]=await Promise.all([sharp(a.buffer).ensureAlpha().raw().toBuffer(),sharp(b.buffer).ensureAlpha().raw().toBuffer()]);let changed=0;const outside=[];
    for(let k=0;k<on.length;k+=4)if(on[k]!==off[k]||on[k+1]!==off[k+1]||on[k+2]!==off[k+2]){
     changed++;const x=k/4%1920,y=Math.floor(k/4/1920);
     if(!(x>=active.x-3&&x<=active.x+active.width+3&&y>=active.y-3&&y<=active.y+active.height+3))outside.push({x,y,on:[...on.subarray(k,k+3)],off:[...off.subarray(k,k+3)]});
    }
    const outsideMax=outside.reduce((m,p)=>Math.max(m,...p.on.map((v,i)=>Math.abs(v-p.off[i]))),0),outsideMAE=outside.reduce((s,p)=>s+p.on.reduce((a,v,i)=>a+Math.abs(v-p.off[i]),0),0)/(1920*1080*3);
    // 关闭注释的连续重绘也可能存在少量 GPU 像素舍入波动。
    // 只容许整帧 <0.0001/255 的均差、最多 256 像素及 16/255 的局部差，不放宽布局或内容差异。
    if(outside.length>256||outsideMax>16||outsideMAE>.0001){fs.writeFileSync(path.join(dir,'outside-'+n.id+'-on.png'),a.buffer);fs.writeFileSync(path.join(dir,'outside-'+n.id+'-off.png'),b.buffer);fs.writeFileSync(path.join(dir,'outside-'+n.id+'.json'),JSON.stringify(outside));throw new Error('卡片外像素差异超出重复绘帧容差：'+n.id+' '+t+' count='+outside.length+' max='+outsideMax+' mae='+outsideMAE);}
    assert(changed>0,'注释没有实际画入像素');
    const file=n.id+'-'+j+'.png';fs.writeFileSync(path.join(dir,file),a.buffer);
    const label=Buffer.from('<svg width="480" height="270"><rect x="250" width="230" height="25" fill="#202234"/><text x="258" y="18" font-family="Arial" font-size="16" fill="white">'+n.id+' '+t.toFixed(2)+'s</text></svg>');
    tiles.push(await sharp(a.buffer).resize(480,270).composite([{input:label}]).png().toBuffer());report.cues.push({id:n.id,t,...active,changedPixels:changed,outsideCard:{pixels:outside.length,max:outsideMax,mae:outsideMAE}});
   }
   for(const t of [n.start-.01,n.end+.01]){
    await page.evaluate(()=>whaleAnnotations.enabled=true);await render(page,t);const active=await page.evaluate(()=>whaleAnnotations.active);
    assert(!active||active.id!==n.id,'注释边界没有退出：'+n.id);report.boundaryChecks.push({id:n.id,t,absent:true});
   }
  }
  await page.evaluate(()=>whaleAnnotations.enabled=true);const a=await render(page,107.4);await render(page,3.7);const b=await render(page,107.4);assert(hash(a.buffer)===hash(b.buffer),'乱序注释绘制不确定');report.randomAccessExact=true;
  for(let sheet=0;sheet<Math.ceil(tiles.length/12);sheet++)await sharp({create:{width:1440,height:1080,channels:3,background:'#202234'}}).composite(tiles.slice(sheet*12,sheet*12+12).map((input,i)=>({input,left:i%3*480,top:Math.floor(i/3)*270}))).png().toFile(path.join(dir,'sheet-'+sheet+'.png'));
  assert(!errors.length,errors.join('\n'));fs.writeFileSync(path.join(dir,'validation.json'),JSON.stringify(report,null,2));console.log('Annotation check passed: '+notes.length+' notes, '+report.cues.length+' frames, '+report.boundaryChecks.length+' boundaries; outside-card changes within measured redraw tolerance.');
 }finally{await page.close();}
};
