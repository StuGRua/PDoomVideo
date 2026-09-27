const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright');
const sharp = require('sharp');
const { chromeOptions } = require('../runtime.cjs');
const root = path.resolve(__dirname, '../..'), out = path.join(root, 'out/covers');
const temporary = path.join(root, 'out/whale-cover-formats');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const formats = [
  { id: '16x9', width: 1920, height: 1080 },
  { id: '4x3', width: 1600, height: 1200, planet: { x: 460, y: 760, z: 1.06 }, whale: { x: 1235, y: 1120, u: 72 }, meter: { x: 1475, y: 430, scale: .9 } },
  { id: '9x16', width: 1080, height: 1920, planet: { x: 420, y: 1030, z: .97 }, whale: { x: 758, y: 1768, u: 73 }, meter: { x: 935, y: 620, scale: .95 } },
];
const sourcePaths = ['src/core.js', 'src/ch/c06_chorus3.js', 'studio-whale-annotated.html'];
const originals = sourcePaths.map(p => ({ file: p, hash: hash(fs.readFileSync(path.join(root, p))) }));
(async () => {
  fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(temporary, { recursive: true });
  const reports = [], errors = [];
  const browser = await chromium.launch({ headless: true, ...chromeOptions(), args: ['--allow-file-access-from-files', '--ignore-gpu-blocklist', '--use-angle=vulkan', '--enable-gpu-rasterization'] });
  try {
    for (const format of formats) {
      // 临时页面使用独立画布尺寸；源文件及正片入口均不写入。
      const corePath = path.join(temporary, 'core-' + format.id + '.js');
      const core = fs.readFileSync(path.join(root, 'src/core.js'), 'utf8');
      assert(core.includes('const W = 1920, H = 1080;'));
      fs.writeFileSync(corePath, core.replace('const W = 1920, H = 1080;', 'const W = ' + format.width + ', H = ' + format.height + ';'));
      const chapter = fs.readFileSync(path.join(root, 'src/ch/c06_chorus3.js'), 'utf8');
      const end = chapter.lastIndexOf('})();'); assert(end > 0);
      const chapterPath = path.join(temporary, 'chapter-' + format.id + '.js');
      fs.writeFileSync(chapterPath, chapter.slice(0, end) + fs.readFileSync(path.join(__dirname, 'adapt-fuse-scene.js'), 'utf8') + '\n' + chapter.slice(end));
      let html = fs.readFileSync(path.join(root, 'studio-whale-annotated.html'), 'utf8');
      html = html.replace('<head>', '<head><base href="' + pathToFileURL(root + path.sep).href + '">')
        .replace('src="src/core.js"', 'src="' + pathToFileURL(corePath).href + '"')
        .replace('src="src/ch/c06_chorus3.js"', 'src="' + pathToFileURL(chapterPath).href + '"')
        .replace('id="out" width="1920" height="1080"', 'id="out" width="' + format.width + '" height="' + format.height + '"');
      const htmlPath = path.join(temporary, format.id + '.html'); fs.writeFileSync(htmlPath, html);
      const page = await browser.newPage({ viewport: { width: format.width, height: format.height } });
      page.on('pageerror', e => errors.push(e.message));
      try {
        await page.goto(pathToFileURL(htmlPath).href + '?render&notes=off');
        await page.waitForFunction(() => window.ready && window.whaleReady, null, { timeout: 60000 });
        const data = await page.evaluate(async o => {
          if (o.id !== '16x9') { window.coverComposition = o; window.LOOP = window.coverFuseScene; }
          karaoke = function () {};
          const clean = await window.renderAt(103.5, 'image/png');
          await document.fonts.load('400 188px WhaleChinese');
          const canvas = document.createElement('canvas'); canvas.width = o.width; canvas.height = o.height;
          const c = canvas.getContext('2d'); c.drawImage(outC, 0, 0); c.lineJoin = 'round';
          function text(value, x, y, size, color, outline = 10) {
            c.font = '400 ' + size + 'px "WhaleChinese", sans-serif'; c.lineWidth = outline; c.strokeStyle = '#17172f';
            c.strokeText(value, x + 2, y + 5); c.fillStyle = color; c.fillText(value, x, y); return c.measureText(value).width;
          }
          function arrow(x, y, scale) {
            c.save(); c.translate(x, y); c.rotate(.16); c.scale(scale, scale);
            c.beginPath(); c.moveTo(0, 78); c.lineTo(0, 10); c.lineTo(-30, 10); c.lineTo(16, -40); c.lineTo(64, 10); c.lineTo(34, 10); c.lineTo(34, 78); c.closePath();
            c.strokeStyle = '#17172f'; c.lineWidth = 10; c.stroke(); c.fillStyle = '#ef7a64'; c.fill(); c.restore();
          }
          let titleRight;
          if (o.id === '16x9') {
            text('大肥鱼单曲', 971, 82, 54, '#ffeed0', 5);
            titleRight = 932 + text('AI末日概率', 932, 214, 140, '#fff0d8', 11);
            const end = 973 + text('上升中', 973, 362, 153, '#f4c34e', 11); arrow(end + 27, 270, 1.02);
          } else if (o.id === '9x16') {
            text('大肥鱼单曲', 100, 143, 67, '#ffeed0', 6);
            titleRight = 72 + text('AI末日概率', 72, 307, 171, '#fff0d8', 12);
            const end = 98 + text('上升中', 98, 497, 191, '#f4c34e', 12); arrow(end + 42, 380, 1.28);
          } else {
            text('大肥鱼单曲', 825, 89, 53, '#ffeed0', 5);
            titleRight = 785 + text('AI末日概率', 785, 219, 130, '#fff0d8', 10);
            const end = 825 + text('上升中', 825, 359, 143, '#f4c34e', 10); arrow(end + 24, 273, 1);
          }
          if (titleRight > o.width - 55) throw new Error('标题超出安全边距');
          return { clean, cover: canvas.toDataURL('image/png'), gpu: gpuInfo(), anchors: window.coverSceneAnchors, titleRight };
        }, format);
        assert(data.gpu.toLowerCase().includes('vulkan'));
        const clean = Buffer.from(data.clean.split(',')[1], 'base64'), cover = Buffer.from(data.cover.split(',')[1], 'base64');
        fs.writeFileSync(path.join(out, 'source-' + format.id + '.png'), clean);
        fs.writeFileSync(path.join(out, 'cover-' + format.id + '.png'), cover);
        await sharp(cover).jpeg({ quality: 94, chromaSubsampling: '4:4:4' }).toFile(path.join(out, 'cover-' + format.id + '.jpg'));
        await sharp(cover).resize({ width: 320 }).png().toFile(path.join(out, 'preview-' + format.id + '.png'));
        reports.push({ ...format, time: 103.5, method: format.id === '16x9' ? 'original-frame-and-title' : 'recompose-original-scene-functions', sourceSha256: hash(clean), sha256: hash(cover), anchors: data.anchors, titleRight: data.titleRight });
      } finally { await page.close(); }
    }
  } finally { await browser.close(); }
  assert.equal(errors.length, 0, errors.join('\n'));
  for (const item of originals) assert.equal(hash(fs.readFileSync(path.join(root, item.file))), item.hash);
  fs.writeFileSync(path.join(out, 'validation.json'), JSON.stringify({ concept: 'a-fuse', generatedArtworkUsed: false, sourceFilesUnchanged: originals, pageErrors: errors, formats: reports }, null, 2) + '\n');
  console.log(JSON.stringify(reports));
})().catch(error => { console.error(error); process.exitCode = 1; });
