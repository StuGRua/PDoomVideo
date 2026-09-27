// 名词注释在独立入口接入，按原片时间直接绘制，不影响演员、歌词或笔触随机序列。
(() => {
 const params=new URLSearchParams(location.search);
 const state=window.whaleAnnotations={enabled:params.get('notes')!=='off'&&params.get('lang')!=='en',cues:WHALE_TERMS,active:null};
 const original=composite;
 const font=size=>'400 '+size+'px "Shantell Sans", "WhaleChinese", sans-serif';
 composite=function(t){
  original(t);state.active=null;
  if(!state.enabled)return;
  const note=WHALE_TERMS.find(n=>t>=n.start&&t<n.end);if(!note)return;
  const c=outX;c.save();
  try{
   c.globalCompositeOperation='source-over';c.globalAlpha=Math.min(ease((t-note.start)/.15),ease((note.end-t)/.15));
   c.textAlign='left';c.textBaseline='alphabetic';c.font=font(31);
   const lines=note.lines||[note.text],height=126+40*(lines.length-1);
   const textWidth=Math.max(...lines.map(line=>c.measureText(line).width));c.font=font(35);const titleWidth=c.measureText(note.term).width;
   const position=(note.positionChanges||[]).filter(p=>t>=p.at).at(-1)||note;
   const w=Math.max(textWidth+50,titleWidth+66,490),x=position.x??note.x??76,y=position.y??note.y??70;
   c.fillStyle='rgba(243,235,220,.96)';c.strokeStyle=PAL.ink;c.lineWidth=3;
   c.beginPath();c.moveTo(x+4,y);c.lineTo(x+w,y+2);c.lineTo(x+w-3,y+height);c.lineTo(x,y+height-3);c.closePath();c.fill();c.stroke();
   c.fillStyle=PAL.ochre;c.fillRect(x+22,y+19,6,34);c.fillStyle=PAL.ink;c.fillText(note.term,x+42,y+45);
   c.font=font(31);lines.forEach((line,i)=>c.fillText(line,x+24,y+94+40*i));
   state.active={id:note.id,term:note.term,text:note.text,lines,x,y,width:w,height,textWidth,titleWidth,alpha:c.globalAlpha};
  }finally{c.restore();}
 };
})();
