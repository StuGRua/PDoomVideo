// 所有工具共享可配置的浏览器和编码器位置，不依赖个人机器目录。
const fs = require('node:fs');
function chromeOptions(explicit) {
  const configured = explicit || process.env.CHROME_PATH;
  if (configured) return { executablePath: configured };
  const standard = process.platform === 'win32' ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome';
  return fs.existsSync(standard) ? { executablePath: standard } : {};
}
module.exports = { chromeOptions, ffmpeg: process.env.FFMPEG_PATH || 'ffmpeg', ffprobe: process.env.FFPROBE_PATH || 'ffprobe' };
