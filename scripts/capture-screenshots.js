#!/usr/bin/env node
/**
 * Screenshot capture script for README documentation
 * Usage: node scripts/capture-screenshots.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const TABS = ['Speech', 'Model', 'Pose', 'Combos', 'VRMA', 'Scene'];

const MODELS = [
  'Hinase', 'Yukina', 'Rii', 'Uina', 'Ruika', 'Yue'
];

const VRMA_ANIMATIONS = [
  'Show Full Body', 'Greeting', 'Peace Sign', 'Spin'
];

async function captureScreenshots() {
  const docsDir = path.join(__dirname, '..', 'public', 'docs');
  
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 800 });

  console.log('Navigating to localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 60000 });
  await wait(4000);

  // Capture main interface
  console.log('Capturing: main-interface...');
  await page.screenshot({ path: path.join(docsDir, 'main-interface.png') });

  // Capture each tab
  for (const tab of TABS) {
    console.log(`Capturing: ${tab.toLowerCase()}-panel...`);
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await btn.evaluate(el => el.textContent);
      if (text && text.includes(tab)) {
        await btn.click();
        await wait(1000);
        break;
      }
    }
    await page.screenshot({ path: path.join(docsDir, `${tab.toLowerCase()}-panel.png`) });
  }

  // Switch to Model tab and capture different models
  console.log('Switching to Model tab for model screenshots...');
  const modelButtons = await page.$$('button');
  for (const btn of modelButtons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('Model')) {
      await btn.click();
      await wait(1000);
      break;
    }
  }

  for (const modelName of MODELS) {
    console.log(`Capturing model: ${modelName}...`);
    try {
      await page.select('select', modelName);
      await wait(3000);
      await page.screenshot({ path: path.join(docsDir, `model-${modelName.toLowerCase()}.png`) });
    } catch (e) {
      console.log(`  Could not select ${modelName}: ${e.message}`);
    }
  }

  // Switch to VRMA tab and capture animations
  console.log('Switching to VRMA tab for animation screenshots...');
  const vrmaButtons = await page.$$('button');
  for (const btn of vrmaButtons) {
    const text = await btn.evaluate(el => el.textContent);
    if (text && text.includes('VRMA')) {
      await btn.click();
      await wait(1000);
      break;
    }
  }

  for (const animName of VRMA_ANIMATIONS) {
    console.log(`Capturing VRMA: ${animName}...`);
    try {
      const animButtons = await page.$$('button');
      for (const btn of animButtons) {
        const text = await btn.evaluate(el => el.textContent);
        if (text && text.trim() === animName) {
          await btn.click();
          await wait(2000);
          await page.screenshot({ 
            path: path.join(docsDir, `vrma-${animName.toLowerCase().replace(/\s+/g, '-')}.png`) 
          });
          // Click again to stop
          await btn.click();
          await wait(500);
          break;
        }
      }
    } catch (e) {
      console.log(`  Could not capture ${animName}: ${e.message}`);
    }
  }

  await browser.close();
  console.log('Done! Screenshots saved to public/docs/');
}

captureScreenshots().catch(console.error);
