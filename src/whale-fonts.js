// 本地字体随项目固定；字体加载失败应中止导出，不能静默换回系统字体。
(() => {
  if(new URLSearchParams(location.search).get('lang')==='en')return;
  const originalSetup=setup;
  setup=async function(){
    const face=new FontFace('WhaleChinese','url("assets/fonts/ZCOOLKuaiLe-Regular.ttf")',{weight:'400'});
    document.fonts.add(await face.load());
    window.whaleLocalizationFont='WhaleChinese';
    window.whaleLocalizationWeight=400;
    await originalSetup();
  };
})();
