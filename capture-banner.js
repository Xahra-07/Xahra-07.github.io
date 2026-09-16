const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

let executablePath = '';

if (fs.existsSync(chromePath)) {
  executablePath = chromePath;
  console.log('Found Google Chrome at:', chromePath);
} else if (fs.existsSync(edgePath)) {
  executablePath = edgePath;
  console.log('Found Microsoft Edge at:', edgePath);
} else {
  console.error('Could not find Google Chrome or Microsoft Edge browser executable.');
  process.exit(1);
}

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set the viewport size to match the banner dimensions exactly
  await page.setViewport({
    width: 1584,
    height: 396,
    deviceScaleFactor: 2 // High-DPI screenshot for crisp text and elements
  });

  const htmlPath = path.resolve(__dirname, 'banner-design.html');
  const fileUrl = `file://${htmlPath.replace(/\\/g, '/')}`;
  console.log('Navigating to:', fileUrl);

  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Wait 1.5 seconds to make sure Google Fonts are loaded and rendered
  console.log('Waiting for fonts and layout to settle...');
  await new Promise(resolve => setTimeout(resolve, 1500));

  const outputPath = path.resolve(__dirname, 'linkedin_banner.png');
  console.log('Taking screenshot...');
  await page.screenshot({
    path: outputPath,
    clip: {
      x: 0,
      y: 0,
      width: 1584,
      height: 396
    }
  });

  console.log('Banner generated and saved successfully to:', outputPath);
  await browser.close();
})();
