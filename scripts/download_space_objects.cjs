const fs = require('fs');
const path = require('path');
const https = require('https');

const objects = [
  'Sun', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Earth', 'Venus',
  'Mars', 'Ganymede (moon)', 'Titan (moon)', 'Mercury (planet)', 'Callisto (moon)',
  'Io (moon)', 'Moon', 'Europa (moon)', 'Triton (moon)', 'Pluto',
  'Eris (dwarf planet)', 'Titania (moon)', 'Haumea', 'Rhea (moon)',
  'Oberon (moon)', 'Iapetus (moon)', 'Makemake', '225088 Gonggong',
  'Charon (moon)', 'Umbriel (moon)', 'Ariel (moon)', 'Dione (moon)',
  '50000 Quaoar', 'Tethys (moon)', 'Ceres (dwarf planet)', '90482 Orcus',
  '90377 Sedna', '120347 Salacia'
];

const outDir = path.join(__dirname, '../public/textures/objects');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Helper to fetch JSON from API
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'LearningJemz/1.0 (https://github.com/j4mesh3nry/learningjemz)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

// Helper to download image
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'LearningJemz/1.0 (https://github.com/j4mesh3nry/learningjemz)' } }, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (let objName of objects) {
    try {
      const cleanName = objName.replace(/ \(.*?\)/, '').replace(/^[0-9]+ /, '').toLowerCase();
      const destPath = path.join(outDir, `${cleanName}.jpg`);

      console.log(`[FETCH] Looking up ${objName}...`);
      
      // Get page info to find the main image
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(objName)}&prop=pageimages&format=json&pithumbsize=500`;
      const searchData = await fetchJson(searchUrl);
      
      const pages = searchData.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId === '-1' || !pages[pageId].thumbnail) {
        console.log(`  -> No thumbnail found for ${objName}`);
        continue;
      }
      
      const imgUrl = pages[pageId].thumbnail.source;
      console.log(`  -> Downloading from ${imgUrl}`);
      
      await downloadImage(imgUrl, destPath);
      console.log(`  -> Saved ${cleanName}.jpg`);
      
      // Sleep a bit to be polite to the API
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`[ERROR] Failed to fetch ${objName}:`, err.message);
    }
  }
  console.log('Done!');
}

run();
