import { chromium } from 'playwright';
const shots = [
  ['chaine-de-confiance', 'tmp/mission-07.png'],
  ['seuil-critique', 'tmp/mission-08.png'],
  ['derniere-ligne', 'tmp/mission-09.png'],
];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
// Unlock missions 00-09 in local progress so M07+ is accessible
await page.goto('http://localhost:3000/app');
await page.evaluate(() => {
  const key = 'mlini-progress-v1';
  const raw = localStorage.getItem(key);
  let p = raw ? JSON.parse(raw) : {};
  const ids = ['mission-00','mission-01','mission-02','mission-03','mission-04','mission-05','mission-06','mission-07','mission-08','mission-09','mission-10'];
  p.completedMissions = ids.slice(0, 6);
  p.unlockedMissions = ids;
  p.xp = p.xp || 500;
  localStorage.setItem(key, JSON.stringify(p));
});
for (const [slug, out] of shots) {
  await page.goto(`http://localhost:3000/app/kingdom/construire-avec-ia/mission/${slug}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: out, fullPage: false });
  console.log('shot', out);
}
await browser.close();
