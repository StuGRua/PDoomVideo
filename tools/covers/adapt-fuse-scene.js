// 仅注入封面临时页面的 c06 闭包；沿用原片绘制函数与 103.5 秒的角色姿态。
window.coverFuseScene = function (t) {
  const o = window.coverComposition;
  V = { cx: P[0] - (o.planet.x - W / 2) / o.planet.z, cy: P[1] - (o.planet.y - H / 2) / o.planet.z, z: o.planet.z };
  space(t); planet(t);
  const burn = kf(t, [[103.19, 0], [104.56, 1]], x => x * (.55 + .45 * x));
  fuse(t, burn); bomb(t, 1);
  islandAndResearcher(t, { lookX: clamp((pointAt(FUSE, FUSE_L, burn)[0] - ISL[0]) / 60, -1, 1), lookY: 0, brows: 'worried', mouth: 'wobble', aL: -.9, aR: -.9, ...mood(t, [[100.5, 'look'], [103.72, 'wide', '!'], [104.62, 'closed', 'sweat']]) });
  const sparkPoint = pointAt(FUSE, FUSE_L, burn);
  spark(SX(sparkPoint[0]), SY(sparkPoint[1]), V.z * .8, t);
  const aL = kf(t, [[102.2, 1], [102.4, 1.2], [102.53, -.55], [102.72, .4], [103.02, .4], [103.19, -.3], [103.4, -.25], [103.62, 1.35]], ease);
  const aR = kf(t, [[102.2, -.4], [103.4, -.4], [103.62, 1.35]], ease);
  clawd(o.whale.x, o.whale.y, o.whale.u, { noShadow: true, dy: Math.sin(t * 2.2) * .3, aL, aR, mouth: 'cat', blush: true, ...mood(t, [[101.7, 'narrow'], [102.56, 'spark', 'spark'], [103.25, 'happy'], [103.62, 'closed', 'sweat']]) });
  const hand = window.whaleFull.last.anchors.hands[0];
  const tip = [SX(1242), SY(490)];
  match(hand[0], hand[1], Math.atan2(hand[1] - tip[1], hand[0] - tip[0]), o.whale.u, backOut(seg(t, 102.55, 102.7)), t, Math.hypot(tip[0] - hand[0], tip[1] - hand[1]));
  // 用原片概率表函数；相机同时变换其图形、英文和中文标识。
  camBegin(1760 - (o.meter.x - W / 2) / o.meter.scale, 110 - (o.meter.y - H / 2) / o.meter.scale, o.meter.scale);
  cornerMeter(t); camEnd();
  window.coverSceneAnchors = { hand, matchTip: tip, fuseSpark: [SX(sparkPoint[0]), SY(sparkPoint[1])], probability: pdoomAt(t) };
};
