// 检查点适配：近景、老板椅、跑步机和萨克斯；入口仍与原片分离。
// 使用已确认的 v03/v04 角色，其他镜头继续调用原角色。
(() => {
  const baseClawd = clawd, baseSetup = setup, baseDraw = draw;
  const state = window.whaleCheck = {active:false, anchors:null, pendingChair:false, mode:'normal', calls:[]};
  let assets, full, upper, lower;
  const names=['front','front-cup','eye-0','eye-1','mouth','side-shoe','front-instrument','side-run','closed-eye-0','closed-eye-1'];
  const load = name => new Promise((resolve,reject) => {
    const img=new Image(); img.onload=()=>resolve([name,img]); img.onerror=()=>reject(new Error(`角色素材加载失败：${name}`));
    img.src='assets/whale/'+name+'.png';
  });
  const shape=(c,d,fill,stroke='#272640',w=3)=>{
    const p=new Path2D(d); if(fill){c.fillStyle=fill;c.fill(p);} if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.lineJoin='round';c.lineCap='round';c.stroke(p);}
  };
  function tube(c,a,b,w,fill){c.lineCap='round';c.strokeStyle='#352C49';c.lineWidth=w+5;c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();c.strokeStyle=fill;c.lineWidth=w;c.stroke();}
  function star(c,x,y,r){const p=[];for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,rr=i%2?r*.34:r;p.push(`${i?'L':'M'}${x+Math.cos(a)*rr} ${y+Math.sin(a)*rr}`);}shape(c,p.join(' ')+'Z','#FFF6C9','#BC8131',1.5);}
  function drawFace(c,o){
    const blink=o.eyes==='closed'||o.eyes==='happy'?1:o.eyes==='narrow'?.4:0;
    for(const [i,cx] of [[0,372],[1,529]]){
      if(blink>0)c.drawImage(assets[`closed-eye-${i}`],0,0);
      if(blink<.98){c.save();c.translate(0,438);c.scale(1,1-blink);c.translate(0,-438);c.drawImage(assets[`eye-${i}`],0,0);c.restore();}
      if(blink>.5)shape(c,`M${cx-34} 420Q${cx} ${o.eyes==='happy'?394:442} ${cx+31} 420`,null,'#342136',5);
      if(o.eyes==='spark')star(c,cx,403,23+2*Math.sin(T*5));
    }
    if(o.mouth==='O')shape(c,'M438 453C450 443 460 458 457 474C447 485 438 475 438 453Z','#B66978','#805164',2);
    else if(o.mouth==='smile')shape(c,'M436 459Q446 471 458 459',null,'#BD7480',2.5);
    else c.drawImage(assets.mouth,0,0);
  }
  function heldCup(c){
    const hand=[675,614];
    tube(c,[550,542],[583,616],51,'#303969');tube(c,[583,616],[662,610],43,'#303969');
    c.save();c.translate(...hand);
    shape(c,'M29 -39C-5 -47 -6 -4 29 -8',null,'#293653',9);
    shape(c,'M29 -39C-5 -47 -6 -4 29 -8',null,'#72B3AA',5);
    shape(c,'M25 -54H89L84 -6Q57 13 30 -6Z','#419B94','#293653',3);
    shape(c,'M25 -54Q55 -65 89 -54Q58 -44 25 -54Z','#64442F','#293653',2);
    shape(c,'M39 -46L42 -14',null,'#8FD3C3',3);
    shape(c,'M-27 -21L-8 -29L4 1L-18 10Z','#FAF4EB','#292941',2.5);
    shape(c,'M-8 -15Q9 -24 15 -9L15 4Q11 13 6 4Q4 15 -3 8Q-10 16 -16 3Z','#FBECE4','#503949',2);
    c.restore();return hand;
  }
  function character(o,seated){
    full.clear();const c=full.drawingContext;
    c.drawImage(assets[seated?'front-cup':'front'],0,0);drawFace(c,o);
    if(seated){
      heldCup(c);
      shape(c,'M374 132L366 60L405 87L450 35L486 88L528 61L520 132Z','#F4CB50','#34304A',4);
      for(const [x,col] of [[401,'#56AFA9'],[449,'#DA799A'],[491,'#56AFA9']]){c.beginPath();c.ellipse(x,112,7,9,0,0,Math.PI*2);c.fillStyle=col;c.fill();}
      upper.clear();lower.clear();
      upper.drawingContext.drawImage(full.canvas,0,0,830,800,0,0,830,800);
      lower.drawingContext.drawImage(full.canvas,0,800,830,224,0,800,830,224);
    }
  }
  const RUN={period:.44,stance:.4,speed:330,scale:.36,ground:834,hip:832,l1:89,l2:68};
  // 时间直接确定步态。支撑脚相对地面向左移动，速度严格等于履带速度。
  function runPose(t,fast=false){
    const gait=fast?{...RUN,period:.15,stance:.14,speed:1900}:RUN;
    const dt=t-(fast?OFF+62*BEAT:38.5),bob=-7*(1+Math.cos((dt/gait.period-.45)*Math.PI*4))/2;
    const span=gait.speed/RUN.scale*gait.period*gait.stance;
    const contacts=[.5,0].map((offset,i)=>{
      const total=dt/gait.period+offset,cycle=Math.floor(total),phase=total-cycle;
      const stance=phase<gait.stance,q=Math.max(0,(phase-gait.stance)/(1-gait.stance));
      const fx=1074-span/2+(stance?span*phase/gait.stance:span*(1-ease(q)));
      const fy=988-(stance?0:48*Math.sin(Math.PI*q));
      const hip=[1090,832+bob],ankle=[fx+16,fy-36],dx=ankle[0]-hip[0],dy=ankle[1]-hip[1],d=Math.hypot(dx,dy);
      const along=(RUN.l1**2-RUN.l2**2+d*d)/(2*d),h=Math.sqrt(Math.max(0,RUN.l1**2-along*along));
      const knee=[hip[0]+dx/d*along-dy/d*h,hip[1]+dy/d*along+dx/d*h];
      return {leg:i,cycle,phase,stance,foot:[fx,fy],hip,knee,ankle,distance:d,reachable:d<RUN.l1+RUN.l2&&d>Math.abs(RUN.l1-RUN.l2),
        worldFoot:[1030-(fx-1090)*RUN.scale,RUN.ground+(fy-988)*RUN.scale]};
    });
    return {bob,contacts};
  }
  function runner(fast=false){
    const pose=runPose(T,fast),c=full.drawingContext;full.clear();
    c.save();c.translate(449,0);c.scale(-1,1);c.translate(-1090,0);
    for(const contact of pose.contacts){
      c.save();if(contact.leg===0)c.filter='brightness(.82)';
      tube(c,contact.hip,contact.knee,60,'#FBECE4');tube(c,contact.knee,contact.ankle,46,'#F7F3EE');
      c.save();c.translate(...contact.knee);c.rotate(Math.atan2(contact.ankle[1]-contact.knee[1],contact.ankle[0]-contact.knee[0])-Math.PI/2);
      shape(c,'M-28 -5Q-33 4 -24 10Q-12 16 0 11Q15 16 28 6L27 -7Z','#FFF9F3','#635C7A',2);c.restore();
      c.save();c.translate(contact.foot[0]-1072,contact.foot[1]-988);c.drawImage(assets['side-shoe'],0,0);c.restore();c.restore();
    }
    c.translate(0,pose.bob);c.drawImage(assets['side-run'],0,0);
    const swing=Math.sin((T-(fast?OFF+62*BEAT:38.5))/(fast?.15:RUN.period)*Math.PI*2),elbow=[1050+22*swing,634],hand=[984+22*swing,596-12*swing];
    tube(c,[1087,553],elbow,58,'#303969');tube(c,elbow,[hand[0]+9,hand[1]+4],44,'#303969');
    c.save();c.translate(...hand);c.rotate(.45);
    shape(c,'M-2 -23H20V23H-2Z','#FFF8EF','#302941',2);
    shape(c,'M-3 -17Q-23 -21 -27 -9L-25 8Q-21 17 -14 11Q-4 18 3 8Z','#FBECE4','#503949',2);c.restore();
    c.restore();state.motion=pose;
  }
  function saxophone(o){
    full.clear();const c=full.drawingContext,angle=.012*Math.sin(bpOf(T)*Math.PI/2);
    c.save();c.translate(449,988);c.rotate(angle);c.translate(-449,-988);
    c.drawImage(assets['front-instrument'],0,0);drawFace(c,{...o,mouth:'smile'});
    // 肩带与袖臂先画，吹嘴、管身和按键随后，手指最后盖住按键边缘。
    shape(c,'M410 512Q431 584 515 627Q554 568 492 512',null,'#1D253B',7);
    for(const [a,b,d] of [[[342,541],[386,620],[500,558]],[[554,540],[595,610],[531,638]]]){
      tube(c,a,b,52,'#303969');tube(c,b,d,43,'#303969');
    }
    const pipe='M459 466C503 464 535 480 526 517L509 683C504 733 532 774 581 760C621 749 630 705 641 658';
    shape(c,pipe,null,'#30263D',29);shape(c,pipe,null,'#E7B84C',21);
    shape(c,'M467 464C505 467 526 479 518 518L501 681C496 730 528 780 583 751',null,'#FFE8A3',4);
    shape(c,'M446 459L467 459L466 473L447 467Z','#302B3E','#30263D',2);
    shape(c,'M628 674L611 640Q646 616 680 640L656 677Z','#EFC65E','#30263D',4);
    shape(c,'M611 640C616 624 672 623 680 640C671 656 625 657 611 640Z','#6F492A','#30263D',4);
    shape(c,'M620 638Q645 629 670 640',null,'#F8D983',3);
    for(const y of [539,561,585,612,638,663,687]){
      const x=526-(y-517)*.102;c.beginPath();c.ellipse(x,y,7,6,0,0,Math.PI*2);c.fillStyle='#FFF0BE';c.fill();c.strokeStyle='#695330';c.lineWidth=2;c.stroke();
    }
    for(const [hx,hy,flip] of [[512,560,-1],[514,638,1]]){
      c.save();c.translate(hx,hy);c.scale(flip,1);
      const finger=1.5*Math.sin((T-105.4)*Math.PI*4+hy);
      c.transform(1,0,0,1,0,finger);
      shape(c,'M8 -20L30 -19L32 17L11 21Z','#FFF8EF','#302941',2);
      shape(c,'M14 -15Q1 -22 -9 -16L-17 -11Q-22 -5 -12 -3L-3 -5L-16 1Q-24 7 -13 10L-2 6Q-18 16 -8 20L8 14Q21 11 19 2Z','#FBECE4','#503949',2);
      c.restore();
    }
    // 小礼帽沿用原镜头语义，保留发箍、呆毛和脸型。
    shape(c,'M379 148L392 71L438 84L492 58L513 145Z','#303042','#232337',4);
    shape(c,'M385 119L506 116L509 139L382 142Z','#C74E69','#232337',2);
    shape(c,'M353 147Q433 128 539 144Q521 169 358 164Z','#373449','#232337',4);
    c.restore();
    const transformed=(px,py)=>{const dx=px-449,dy=py-988;return[449+dx*Math.cos(angle)-dy*Math.sin(angle),988+dx*Math.sin(angle)+dy*Math.cos(angle)];};
    state.motion={angle,localMouth:transformed(447,462),localMouthpiece:transformed(447,462),localHands:[[512,560],[514,638]].map(p=>transformed(...p)),localBell:transformed(646,640)};
  }
  state.runPose=runPose;
  // 与 core.flushLetters 相同的提交点，保证前面的 p5.brush 绘制先落到场景。
  function flushPaint(){
    push();brush.noStroke();brush.noHatch();brush.noWash();brush.fill('#000000',1);brush.fillBleed(0);brush.fillTexture(0,0);
    brush.polygon([[-5000,-5000],[-4990,-5000],[-4990,-4990]]);brush.noFill();pop();
  }
  function drawLayer(layer){
    if(state.mode==='hidden'||state.alpha<=0)return;
    flushPaint();push();tint(255,state.alpha*255);
    image(layer,state.x-449*state.scale,state.ground-988*state.scale,830*state.scale,1024*state.scale);
    noTint();pop();
  }
  setup=async()=>{
    assets=Object.fromEntries(await Promise.all(names.map(load)));state.assets=assets;await baseSetup();
    full=createGraphics(830,1024);upper=createGraphics(830,1024);lower=createGraphics(830,1024);
    for(const g of [full,upper,lower])g.pixelDensity(1);
    window.whaleReady=true;
  };
  draw=function(){state.active=false;state.pendingChair=false;state.anchors=null;state.calls=[];state.motion=null;return baseDraw();};
  clawd=function(x,y,u,o={}){
    const close=T>=OFF+5*BEAT&&T<OFF+8*BEAT,seated=T>=12.9&&T<(window.WHALE_FULL?OFF+26*BEAT:16.5)&&o.hat==='crown';
    const fast=window.WHALE_FULL&&T>=OFF+62*BEAT&&T<=44.38&&o.hat==='sweatband';
    const running=(T>=38.5&&T<OFF+60*BEAT&&o.hat==='sweatband')||fast,sax=T>=105.4&&T<109.4&&o.hat==='fedora';
    state.pendingChair=false;state.active=close||seated||running||sax;
    if(!state.active)return window.WHALE_FULL ? window.whaleFull.draw(x,y,u,o) : baseClawd(x,y,u,o);
    state.x=x;state.scale=running?RUN.scale:sax?.52:seated?.48:.69;
    state.ground=running?RUN.ground:sax?850:seated?700+(988-850)*state.scale:y+(o.dy||0)*u;
    state.alpha=seated?ease(((o.sx??1)-.45)/.4):1;
    if(running)runner(fast);else if(sax)saxophone(o);else character(o,seated);
    const toWorld=(px,py)=>[x+(px-449)*state.scale,state.ground+(py-988)*state.scale];
    state.anchors={eyes:[toWorld(372,403),toWorld(529,403)],mouth:toWorld(447,462),
      hand:seated?toWorld(675,614):null,cup:seated?toWorld(732,589):null,
      lap:seated?toWorld(449,850):null,headTop:toWorld(449,18),feet:toWorld(449,988)};
    if(running){const sideWorld=(px,py)=>[x-(px-1090)*state.scale,state.ground+(py+state.motion.bob-988)*state.scale];state.anchors.eyes=[sideWorld(992,402)];state.anchors.mouth=sideWorld(948,464);state.anchors.feet=state.motion.contacts.map(c=>c.worldFoot);}
    if(sax){state.anchors.mouth=toWorld(...state.motion.localMouth);state.anchors.bell=toWorld(...state.motion.localBell);state.anchors.hands=state.motion.localHands.map(p=>toWorld(...p));}
    state.calls.push({t:T,shot:running?'run':sax?'sax':seated?'chair':'close',seated,scale:state.scale,screenScale:state.scale*(CAM?.zoom||1),screenEyes:state.anchors.eyes.map(p=>toScreen(...p)),alpha:state.alpha,anchors:state.anchors,motion:state.motion});
    if(state.calls.length>20)state.calls.shift();
    drawLayer(seated?upper:full);state.pendingChair=seated;
  };
  state.drawChairFront=()=>{
    if(!state.pendingChair||state.mode==='behind-seat')return;
    drawLayer(lower);state.pendingChair=false;
  };
  state.setMode=mode=>{if(!['normal','hidden','behind-seat'].includes(mode))throw new Error('未知检查模式');state.mode=mode;};
  // 原有开发预览控件复用，只列出实际接入的镜头。
  devUI=function(){
    const slider=document.getElementById('scrub'),label=document.getElementById('tt'),choice=document.getElementById('shot');
    let busy=false,want=null;
    const go=async()=>{if(busy)return;busy=true;try{while(want!==null){const t=want;want=null;await window.renderAt(t);label.textContent=`原片 ${t.toFixed(2)} 秒`;}}finally{busy=false;}};
    slider.oninput=()=>{want=Number(slider.value);go();};
    choice.onchange=()=>{const [a,b]={close:[3.62,5.6],chair:[13,16.45],run:[38.5,41.1],sax:[105.4,109.39]}[choice.value];slider.min=a;slider.max=b;slider.value=a;want=a;go();};
    const start=async()=>{while(!window.whaleReady)await new Promise(r=>setTimeout(r,20));choice.onchange();};start();
  };
})();
