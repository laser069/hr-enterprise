const puppeteer = require('puppeteer');
const fs = require('fs');

async function testPuppeteer() {
  console.log('Testing Puppeteer...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('Browser launched successfully');
    const page = await browser.newPage();
    await page.setContent(
      '<h1>Test PDF</h1><p>If you see this, Puppeteer is working.</p>',
    );
    const pdf = await page.pdf({ format: 'A4' });
    console.log('PDF generated successfully, length:', pdf.length);
    fs.writeFileSync('test_puppeteer.pdf', pdf);
    console.log('PDF saved to test_puppeteer.pdf');
  } catch (err) {
    console.error('Puppeteer Error:', err.message);
    if (err.stack) console.error(err.stack);
  } finally {
    if (browser) await browser.close();
  }
}

testPuppeteer();
