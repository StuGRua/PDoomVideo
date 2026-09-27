const fs=require('node:fs'),path=require('node:path');
const sharp=require('sharp');
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
module.exports=async({open,render,docs,fingerprint,errors})=>{
 const dir=path.join(docs,'localization-review');fs.mkdirSync(dir,{recursive:true});
 const page=await open(),en=await open('studio-whale.html','en'),report={fingerprint,lines:[],unchangedArtwork:[],labels:[],errors};
 try{
  const lines=await page.evaluate(()=>LY);
  const data=await page.evaluate(()=>WHALE_ZH);
  assert(lines.length===46&&data.length===46,'歌词数不符');
  data.forEach((cue,i)=>{assert(cue.en===lines[i][2],'英文行不符');assert(cue.groups.map(g=>g.text).join('')===cue.zh,'中文分组丢字');let next=0;cue.groups.forEach(g=>{assert(g.fromWord===next&&g.toWord>=next,'词段不连续');next=g.toWord+1;});assert(next===cue.en.split(' ').length,'词段未覆盖整行');});
  for(const [i,line]of lines.entries()){
   const t=(line[0]+line[1])/2,r=await render(page,t),layout=await page.evaluate(()=>whaleLocalization.layout);
   assert(layout&&layout.index===i,'字幕行未绘制：'+i);
   assert(layout.enSize>=28&&layout.zhSize>=26,'字幕字号过小：'+i);
   assert(layout.enWidth<=1830&&layout.zhWidth<=1830,'字幕横向溢出：'+i);
   assert(layout.tokens.length>1&&layout.tokens.every(w=>Number.isFinite(w.progress)),'中文没有按词高亮：'+i);
   report.lines.push({i,t,...layout});
   if([0,4,5,6,7,12,21,23,33,34,44].includes(i))fs.writeFileSync(path.join(dir,'lyric-'+i+'.png'),r.buffer);
  }
  for(const t of [3.7,13.6,39.4,106.5]){
   const [a,b]=await Promise.all([render(page,t),render(en,t)]),area={left:0,top:0,width:1920,height:974};
   const [left,right]=await Promise.all([sharp(a.buffer).extract(area).raw().toBuffer(),sharp(b.buffer).extract(area).raw().toBuffer()]);
   assert(left.equals(right),'字幕改变了人物或上方画面：'+t);report.unchangedArtwork.push(t);
  }
  for(const t of [.8,24,25.8,59.8,125,145,154]){
   const r=await render(page,t),labels=await page.evaluate(()=>whaleLocalization.labels);
   fs.writeFileSync(path.join(dir,'scene-'+t+'.png'),r.buffer);report.labels.push({t,labels});
  }
  assert(report.labels.find(x=>x.t===.8).labels.some(l=>l.text==='AI末日概率上升中↑'),'片头标题缺失');
  assert(report.labels.find(x=>x.t===25.8).labels.some(l=>l.text==='智能爆炸'),'FOOM 中文缺失');
  assert(report.labels.find(x=>x.t===154).labels.some(l=>l.text==='鲸鱼娘改编与中文本地化：GPT6Astra'),'片尾署名缺失');
  assert(!errors.length,errors.join('\n'));
  fs.writeFileSync(path.join(dir,'validation.json'),JSON.stringify(report,null,2));console.log('Localization check passed: 46 lines, 4 unchanged-artwork crops, 7 scene samples.');
 }finally{await Promise.all([page.close(),en.close()]);}
};
