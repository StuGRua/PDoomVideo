// 全片角色适配。保留原场景时间与叙事，所有姿态只从 T 和调用参数推导。
(() => {
  const state=window.whaleFull={calls:[],special:[],last:null};
  let g,mask;
  const skin='#FBECE4',ink='#302941',dress='#303969';
  function init(){if(g)return;g=createGraphics(1200,1100);g.pixelDensity(1);mask=createGraphics(1200,1100);mask.pixelDensity(1);}
  const assets=()=>window.whaleCheck.assets;
  const shape=(c,d,fill,stroke=ink,w=3)=>{const p=new Path2D(d);if(fill){c.fillStyle=fill;c.fill(p);}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.stroke(p);}};
  const tube=(c,a,b,w,col)=>{for(const [width,color] of [[w+5,ink],[w,col]]){c.lineWidth=width;c.strokeStyle=color;c.lineCap='round';c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();}};
  const disc=(c,x,y,rx,ry,col,stroke=null)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=col;c.fill();if(stroke){c.lineWidth=3;c.strokeStyle=stroke;c.stroke();}};
  function flush(){push();brush.noStroke();brush.noHatch();brush.noWash();brush.fill('#000000',1);brush.fillBleed(0);brush.fillTexture(0,0);brush.polygon([[-5000,-5000],[-4990,-5000],[-4990,-4990]]);brush.noFill();pop();}
  const previousDraw=draw;
  draw=function(){state.calls=[];state.special=[];state.last=null;return previousDraw();};
  function face(c,o){
    const eye=o.eyes||'normal',blink=(o.squint||0)>.7||((T*.9+(o.seed||0)*1.7)%3.3<.1);
    for(const [i,x] of [[0,372],[1,529]]){
      const closed=blink||eye==='closed'||eye==='happy'||(eye==='wink'&&i===0);
      if(closed||['x','narrow','angry'].includes(eye))c.drawImage(assets()['closed-eye-'+i],0,0);
      if(closed)shape(c,'M'+(x-32)+' 420Q'+x+' '+(eye==='happy'?394:439)+' '+(x+31)+' 420',null,ink,5);
      else if(eye==='x'){shape(c,'M'+(x-22)+' 386L'+(x+22)+' 430M'+(x+22)+' 386L'+(x-22)+' 430',null,ink,6);}
      else if(eye==='swirl'){
        c.drawImage(assets()['eye-'+i],0,0);let d='';for(let n=0;n<35;n++){const a=n*.42+T*3,r=n*.63;d+=(n?'L':'M')+(x+Math.cos(a)*r)+' '+(405+Math.sin(a)*r);}shape(c,d,null,'#463778',3);
      }else{
        c.save();if(eye==='narrow'||eye==='angry'){c.translate(0,438);c.scale(1,.65);c.translate(0,-438);}c.drawImage(assets()['eye-'+i],0,0);c.restore();
        if(eye==='heart')shape(c,'M'+x+' 422C'+(x-40)+' 401 '+(x-24)+' 374 '+x+' 394C'+(x+24)+' 374 '+(x+40)+' 401 '+x+' 422Z','#E76E99',null);
        if(eye==='spark'){shape(c,'M'+x+' 377L'+(x+7)+' 397L'+(x+26)+' 405L'+(x+7)+' 413L'+x+' 434L'+(x-7)+' 413L'+(x-26)+' 405L'+(x-7)+' 397Z','#FFF1B5','#A98240',1.5);}
        if(eye==='red'){disc(c,x,405,17,25,'#F13D65');disc(c,x-5,395,5,7,'#FFE6E3');}
        if(eye==='scared')shape(c,'M'+(x-24)+' 349Q'+x+' 335 '+(x+21)+' 347',null,ink,3);
      }
    }
    if(eye==='shades'){shape(c,'M331 374H418L414 420Q372 444 337 416ZM488 374H575L569 417Q527 443 490 419Z','#262640',ink,4);shape(c,'M417 391Q450 375 489 391',null,ink,6);shape(c,'M346 389L370 382M502 389L527 382',null,'#9BB6DB',4);}
    if(o.mouth==='O'||o.mouth==='o')disc(c,447,462,o.mouth==='O'?13:7,o.mouth==='O'?18:10,'#B66978','#825367');
    else if(o.mouth==='grin')shape(c,'M432 453Q448 462 464 453Q459 478 447 478Q435 472 432 453Z','#B66978','#825367',2);
    else if(o.mouth==='flat')shape(c,'M436 464H458',null,'#B97280',2.5);
    else if(o.mouth==='wobble')shape(c,'M432 465Q440 452 448 465Q454 473 462 462',null,'#B97280',3);
    else if(o.mouth==='cat')shape(c,'M432 462Q438 470 447 461Q455 473 463 462',null,'#B97280',2.5);
    else if(o.mouth==='smile')shape(c,'M436 460Q447 471 460 460',null,'#B97280',2.5);
    else c.drawImage(assets().mouth,0,0);
  }
  function accessory(c,h,o){
    if(h==='party') {shape(c,'M399 137L447 20L498 137Z','#D675A8');disc(c,447,21,10,10,'#F4CF79');}
    if(h==='hard'){shape(c,'M363 148Q363 52 450 52Q537 52 537 148Z','#E8C24F');shape(c,'M349 147H548V163H349Z','#F9D56D');shape(c,'M447 64V137',null,'#B58738',6);}
    if(h==='crown'){shape(c,'M380 143L374 72L410 99L450 49L486 99L525 73L518 143Z','#F4CB50');for(const x of [406,450,492])disc(c,x,125,6,8,x===450?'#DD79A0':'#5CAEBC');}
    if(h==='halo'){c.strokeStyle='#E8BC52';c.lineWidth=7;c.beginPath();c.ellipse(449,44,89,19,0,0,TAU);c.stroke();}
    if(h==='wizard'||h==='hood'){shape(c,'M347 151L460 8Q472 56 545 153Z','#655294');shape(c,'M439 83L448 103L470 105L454 122L455 140L437 129L419 136L422 115L407 100L429 101Z','#F3D376',null);}
    if(h==='top'||h==='fedora'){shape(c,h==='top'?'M395 137V42H501V137Z':'M385 139L399 55L444 70L493 48L516 141Z','#303042');shape(c,'M394 112H503V134H394Z','#C94F72');shape(c,'M359 139Q450 125 539 139L535 158Q449 173 361 155Z','#373449');}
    if(h==='band'||h==='sweatband'){shape(c,'M327 248Q452 198 574 250L571 271Q450 224 331 271Z',h==='band'?'#BE516C':'#FFF7E7');}
    if(h==='cat'){for(const [x,s]of [[320,-1],[578,1]]){shape(c,'M'+(x-s*30)+' 175L'+(x+s*7)+' 80L'+(x+s*61)+' 218Z','#5B70B5');shape(c,'M'+(x-s*10)+' 170L'+(x+s*10)+' 115L'+(x+s*38)+' 196Z','#DB9DB4',null);}}
    if(h==='sydney'){shape(c,'M562 163L611 119L620 171L666 151L650 206L613 190L575 213Z','#DC679B');disc(c,611,178,12,16,'#F6ABCD',ink);}
    if(h==='masq'){shape(c,'M323 363Q371 343 423 366L449 383L477 364Q537 344 580 368L568 418Q530 444 486 415L449 395L412 417Q364 440 332 413Z',null,'#80527E',8);}
  }
  function arm(c,side,angle,target,cross=false){
    const shoulder=[side<0?344:553,548];let hand=target||[shoulder[0]+side*Math.cos(angle)*145,shoulder[1]-Math.sin(angle)*145];
    if(cross)hand=[449-side*39,626+side*13];
    const mid=[(shoulder[0]+hand[0])/2+side*22,(shoulder[1]+hand[1])/2+24];
    tube(c,shoulder,mid,49,dress);tube(c,mid,hand,39,dress);
    const a=Math.atan2(hand[1]-mid[1],hand[0]-mid[0]);c.save();c.translate(...hand);c.rotate(a);
    shape(c,'M-17 -23H0V23H-17Z','#FAF6EE',ink,2);
    shape(c,'M0 -15Q23 -21 29 -10L29 10Q25 19 15 13Q4 22 0 9Z',skin,ink,2);
    c.restore();return {hand:[hand[0]+Math.cos(a)*12,hand[1]+Math.sin(a)*12],shoulder,angle:a};
  }
  function pose(x,y,u,o={}){
    const s=(o.whaleScale||.009)*u,rot=o.rot||0,f=(o.flip?-1:1)*((o.sx??1)<0?-1:1),ground=y+(o.dy||0)*u;
    const world=(px,py)=>{const dx=(px-449)*s*f,dy=(py-988)*s;return[x+dx*Math.cos(rot)-dy*Math.sin(rot),ground+dx*Math.sin(rot)+dy*Math.cos(rot)];};
    const local=p=>{const dx=p[0]-x,dy=p[1]-ground;return[449+(dx*Math.cos(rot)+dy*Math.sin(rot))/s/f,988+(-dx*Math.sin(rot)+dy*Math.cos(rot))/s];};
    return {x,y,u,s,rot,f,ground,world,local};
  }
  state.pose=pose;
  state.draw=function(x,y,u,o={}){
    if(u<.15)return;init();g.clear();const c=g.drawingContext;c.save();c.translate(175,30);
    const p=pose(x,y,u,o),A=assets(),cross=(o.aL||0)>2.5&&(o.aR||0)>2.5;
    // 双足小步与跳步，完整裙装盖住髋关节；坐姿以物体前景遮住下半身。
    if(!o.noLegs){
      const walking=o.walk!=null,phase=(o.walk||0)*TAU;
      for(const [i,hx]of [[0,391],[1,491]]){
        const wave=walking?Math.sin(phase+i*Math.PI):0,dx=wave*24,lift=Math.max(0,wave)*24;
        tube(c,[hx,836],[hx+dx*.55,911-lift*.5],61,skin);tube(c,[hx+dx*.55,905-lift*.5],[hx+dx,951-lift],47,'#F8F3EE');
        c.drawImage(A.front,i?445:337,905,110,95,(i?445:337)+dx,905-lift,110,95);
      }
    }
    c.drawImage(A['front-instrument'],0,0,830,855,0,0,830,855);face(c,o);
    const hands=[arm(c,-1,o.aL??-.95,o.whaleHands?.[0]?p.local(o.whaleHands[0]):null,cross),arm(c,1,o.aR??-.95,o.whaleHands?.[1]?p.local(o.whaleHands[1]):null,cross)];
    accessory(c,o.whaleHat||o.hat,o);
    if(o.whaleStrap)shape(c,'M366 522L503 750M531 519L402 748',null,'#896248',17);
    // 吞镜头使用有支杆的鲸口舞台道具，不让人物头部像盒盖一样打开。
    if((o.lid||0)>.02){const k=o.lid,w=190+90*k,h=28+130*k,cy=647;
      tube(c,[335,612],[346,781],10,'#8D6349');tube(c,[562,612],[552,781],10,'#8D6349');
      disc(c,447,cy,w,h,'#384C83',ink);disc(c,447,cy,w-20,Math.max(10,h-18),'#42223E',ink);
      for(let j=0;j<7;j++){const xx=447-w+32+j*(2*w-64)/6;shape(c,'M'+(xx-12)+' '+(cy-h+20)+'L'+(xx+12)+' '+(cy-h+20)+'L'+xx+' '+(cy-h+48)+'Z','#FFF3DB');shape(c,'M'+(xx-12)+' '+(cy+h-20)+'L'+(xx+12)+' '+(cy+h-20)+'L'+xx+' '+(cy+h-48)+'Z','#FFF3DB');}
    }
    c.restore();
    if(!o.noShadow)paint(ellPts(x,y+u*.12,u*3.3,u*.65,16),{wash:'#293148',washOp:42,ink:null});
    flush();push();translate(x,p.ground);rotate(p.rot);scale(p.s*p.f,p.s);image(g,-624,-1018,1200,1100);pop();
    const anchors={eyes:[p.world(372,403),p.world(529,403)],mouth:p.world(447,462),hands:hands.map(a=>p.world(...a.hand)),shoulders:hands.map(a=>p.world(...a.shoulder)),head:p.world(449,65),feet:[p.world(391,988),p.world(491,988)]};
    // 原有持物回调只转换到新手掌；依赖旧身体几何的 draw 回调由具体镜头适配。
    for(const [i,hook]of [[0,o.armL],[1,o.armR]])if(hook&&!o.whaleSkipHooks){push();translate(...anchors.hands[i]);rotate(p.rot+(i===0?(o.aL||0):-(o.aR||0)));if(i===0)scale(-1,1);if(p.f<0)scale(-1,1);hook(u,clamp(u/15,.45,2.4));pop();}
    if(o.whaleChalk){const hand=anchors.hands[1],tip=o.whaleChalk;inkLine([hand,tip],1.8,'#94744F','ink',0);paint(ellPts(tip[0],tip[1],5,5,8),{wash:'#FFF4D9',ink:null});}
    if(o.emote&&o.emoteK!==0){const e=p.world(665,220);emote(o.emote,e[0],e[1],u*.7,o.emoteK??1);}
    state.last={x,y,u,anchors,pose:{s:p.s,rot:p.rot,f:p.f},hat:o.whaleHat||o.hat||null};state.calls.push(state.last);
    window.whaleCheck.active=true;window.whaleCheck.anchors=anchors;
    return anchors;
  };
  state.cube=function(x,y,L,rot,o){
    state.special.push('stage-capsule');
    paint(ellPts(x,y,L*1.25,L*1.25,18),{fill:'#F8CC62',fillOp:90*(o.heat??1),ink:null});
    push();translate(x,y);rotate(rot);
    paint(rrPts(-L*.53,-L*.58,L*1.06,L*1.12,L*.12),{wash:'#405D70',ink:PAL.ink,sw:1.2});
    paint(rrPts(-L*.44,-L*.51,L*.88,L*.91,L*.08),{wash:'#D5EBE4',ink:PAL.ink,sw:.8});
    state.draw(0,L*.38,L*.095,{...o,noShadow:true,aL:1.2,aR:1.2});
    for(const side of [-1,1])paint(rectPts(side*L*.43-L*.025,-L*.49,L*.05,L*.87),{wash:'#87AFB6',ink:null});
    paint(rectPts(-L*.53,L*.4,L*1.06,L*.13),{wash:'#EBC359',ink:PAL.ink,sw:.8});
    for(const xx of [-.35,0,.35])paint(ellPts(xx*L,L*.47,L*.027,L*.027,8),{wash:'#334C66',ink:null});
    pop();
  };
  state.costume=function(side,sxh,x,y,u){
    init();state.special.push('whale-stage-costume');const s=u*.00825;
    g.clear();let c=g.drawingContext;c.save();c.translate(175,30);c.drawImage(assets().front,0,0);face(c,{eyes:'normal',mouth:'smile'});accessory(c,side<0?'halo':'crown',{});c.restore();
    // 带内衬、支架和脚轮的舞台外壳。横向投影只作用于道具。
    const hinge=x+side*360*s;flush();push();translate(hinge,y);scale(sxh,1);translate(-side*360*s,0);
    if(sxh<0){mask.clear();const mc=mask.drawingContext;mc.drawImage(g.canvas,0,0);mc.globalCompositeOperation='source-in';mc.fillStyle='#896584';mc.fillRect(0,0,1200,1100);mc.globalCompositeOperation='source-over';}
    const source=sxh<0?mask:g,cut=side<0?[175,0,449,1100]:[624,0,576,1100];
    image(source,(side<0?-449:0)*s,-1018*s,cut[2]*s,1100*s,...cut);
    if(sxh<0){inkLine([[side*50*s,-830*s],[side*310*s,-185*s],[side*55*s,-185*s],[side*280*s,-820*s]],2,'#C7A578','ink',0);}
    pop();
    for(const dx of [-60,60]){const wx=hinge+(dx-side*180)*s*sxh;paint(ellPts(wx,y+9,13,13,10),{wash:'#3A3D50',ink:PAL.ink,sw:.8});}
  };
  state.patron=function(x,y,u,t,seed){
    const bob=Math.abs(Math.sin(bpOf(t)*Math.PI+seed))*u*.4,yy=y-bob;
    // 背面剪影有头、长发、肩部和发鳍；不再使用盒状观众。
    paint(ellPts(x,yy-u*6,u*3.1,u*3.4,20),{wash:'#10172F',ink:null});
    paint([[x-u*2.5,yy-u*5],[x-u*4,yy+u],[x+u*4,yy+u],[x+u*2.5,yy-u*5]],{wash:'#10172F',ink:null});
    for(const side of [-1,1])paint([[x+side*u*2.3,yy-u*6],[x+side*u*4.4,yy-u*5.3],[x+side*u*2.7,yy-u*4.8]],{wash:'#10172F',ink:null});
    inkLine([[x-u,yy-u*8.8],[x-u*1.2,yy-u*10.2],[x+u*.7,yy-u*10.5],[x+u*.9,yy-u*9]],1.8,'#10172F','ink',.8);
  };
  state.rescue=function(hand,grip,fingers,t){
    state.special.push('rescue-strap');
    const end=[grip[0],grip[1]-6];
    inkLine([hand,[(hand[0]+end[0])/2+12,(hand[1]+end[1])/2],end],3.6,'#B9A077','marker',.2);
    inkLine([hand,end],.65,'#4C4050','ink',0);
    for(let i=0;i<Math.max(1,4-fingers);i++)paint(ellPts(hand[0]+i*3-4,hand[1]+2,2.4,4,8),{wash:skin,ink:PAL.ink,sw:.3});
    paint(ellPts(end[0],end[1],7,5,10),{ink:'#D2B97E',sw:1.2});
  };
  devUI=function(){
    const select=document.getElementById('shot'),slider=document.getElementById('scrub'),label=document.getElementById('tt');
    const titles=['开场与实验室','第一次副歌','起飞与 Sydney','第二次副歌','淘汰与 Gato','第三次副歌','规模与奖励','第四次副歌与揭幕','谢幕'];
    select.innerHTML=CH.map((ch,i)=>'<option value="'+i+'">'+titles[i]+'</option>').join('');
    slider.min=0;slider.max=(Math.ceil(156.6*24)-1)/24;slider.step=1/24;
    let pending=null,busy=false;
    const go=async()=>{if(busy)return;busy=true;try{while(pending!==null){const t=pending;pending=null;await window.renderAt(t);label.textContent='原片 '+t.toFixed(2)+' 秒';}}finally{busy=false;}};
    slider.oninput=()=>{pending=Number(slider.value);go();};select.onchange=()=>{slider.value=CH[Number(select.value)].start+.05;pending=Number(slider.value);go();};
    const start=async()=>{while(!window.whaleReady)await new Promise(r=>setTimeout(r,20));select.onchange();};start();
  };
})();
