// 鲸娘入口专用中文层；原 studio.html 与上游核心保持不变。
(() => {
  const enabled = new URLSearchParams(location.search).get('lang') !== 'en';
  const oldText = drawKaraokeText, oldLetter = letter;
  const font = size => window.whaleLocalizationFont
    ? (window.whaleLocalizationWeight||400)+' '+size+'px "Shantell Sans", "'+window.whaleLocalizationFont+'", sans-serif'
    : '700 '+size+'px "Microsoft YaHei", "Noto Sans CJK SC", sans-serif';
  const split = new Intl.Segmenter('zh-CN', {granularity:'word'});
  const tokens = text => {
    const result=[];let leading='';
    for(const part of split.segment(text)) {
      if(part.isWordLike){result.push(leading+part.segment);leading='';}
      else if(result.length)result[result.length-1]+=part.segment;
      else leading+=part.segment;
    }
    return result;
  };
  const cues = WHALE_ZH.map((line,i) => {
    if(line.en!==LY[i][2]) throw new Error('中文字幕与英文歌词不匹配：'+i);
    const words=line.en.split(' '), offsets=[0];words.forEach(w=>offsets.push(offsets.at(-1)+w.length));
    return {...line, words, offsets, groups:line.groups.map(g=>({...g,tokens:tokens(g.text)}))};
  });
  window.whaleLocalization={enabled,cues,layout:null,labels:[]};
  function highlight(c,txt,x,y,width,progress) {
    c.fillStyle=PAL.cream;c.fillText(txt,x,y);
    if(progress<=0)return;
    c.save();c.beginPath();c.rect(x-1,y-23,width*clamp(progress)+1,46);c.clip();
    c.fillStyle=PAL.ochre;c.fillText(txt,x,y);c.restore();
  }
  drawKaraokeText = function(c) {
    if(!enabled)return oldText(c);
    window.whaleLocalization.layout=null;
    if(!KARAOKE || KARAOKE.grow<.85)return;
    const {a,b,txt}=KARAOKE, index=LY.findIndex(l=>l[0]===a), cue=cues[index];
    c.save();c.textBaseline='middle';c.textAlign='left';
    c.font='800 50px "Shantell Sans", sans-serif';const available=c.measureText(txt).width+35;
    let enSize=34,zhSize=36;
    c.font='800 '+enSize+'px "Shantell Sans", sans-serif';enSize*=Math.min(1,available/c.measureText(txt).width);
    c.font=font(zhSize);zhSize*=Math.min(1,available/c.measureText(cue.zh).width);
    const singDur=Math.min(b-a-.1,.45+txt.length*.075),sung=clamp((T-a)/singDur)*cue.offsets.at(-1);
    c.font='800 '+enSize+'px "Shantell Sans", sans-serif';
    const space=c.measureText(' ').width,widths=cue.words.map(w=>c.measureText(w).width),enWidth=widths.reduce((s,w)=>s+w,0)+space*(widths.length-1);
    let x=960-enWidth/2;
    cue.words.forEach((w,i)=>{highlight(c,w,x,1000,widths[i],(sung-cue.offsets[i])/w.length);x+=widths[i]+space;});
    c.font=font(zhSize);const zhWidth=c.measureText(cue.zh).width;x=960-zhWidth/2;
    const active=[];
    cue.groups.forEach(g=>{
      const start=cue.offsets[g.fromWord],end=cue.offsets[g.toWord+1];
      const progress=clamp((sung-start)/(end-start))*g.tokens.length;
      g.tokens.forEach((word,i)=>{const w=c.measureText(word).width,f=clamp(progress-i);highlight(c,word,x,1043,w,f);active.push({word,progress:f,x,width:w});x+=w;});
    });
    window.whaleLocalization.layout={index,enSize,zhSize,enWidth,zhWidth,top:978,bottom:1065,tokens:active};
    c.restore();
  };
  function label(base,text,size,dy) {
    const y=base.y+dy,x=base.x;
    // 小仪表或镜头放大后出框的文字，不强塞进画面。
    if(size<13 || x-text.length*size*.54<16 || x+text.length*size*.54>1904 || y-size<16 || y+size>963)return;
    oldLetter(text,x,y,size,PAL.cream,{screen:true,rot:base.rot||0,pop:base.pop,alpha:base.alpha,font:font(size)});
    window.whaleLocalization.labels.push({text,x,y,size});
  }
  letter = function(txt,x,y,size,color,o={}) {
    oldLetter(txt,x,y,size,color,o);
    if(!enabled)return;
    const base=LETTERS.at(-1);if(!base)return;
    if(txt==='P(DOOM)') {
      if(base.size>=180)label(base,'AI末日概率上升中↑',42,base.size*.57);
      else label(base,'末日预估概率',Math.min(23,base.size*.43),base.size*(base.size<=40?-.85:.82));
    } else if(txt==='FOOM')label(base,'智能爆炸',Math.min(48,base.size*.24),-base.size*.9);
    else if(txt==='created by Claude Opus 5.5') {
      label(base,'原版动画：Claude Opus 5.5',32,57);
      label(base,'鲸鱼娘改编与中文本地化：GPT6Astra',32,108);
    }
  };
  const oldDraw=draw;
  draw=function(){window.whaleLocalization.labels=[];return oldDraw();};
})();
