const fs = require('fs');
const path = require('path');
const https = require('https');

const curatedImages = {
  'sun': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/500px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
  'mercury': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/500px-Mercury_in_true_color.jpg',
  'venus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Venus_from_Mariner_10.jpg/500px-Venus_from_Mariner_10.jpg',
  'earth': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/The_Earth_seen_from_Apollo_17.jpg/500px-The_Earth_seen_from_Apollo_17.jpg',
  'mars': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/500px-OSIRIS_Mars_true_color.jpg',
  'jupiter': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Jupiter_and_its_shrunken_Great_Red_Spot.jpg/500px-Jupiter_and_its_shrunken_Great_Red_Spot.jpg',
  'saturn': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/500px-Saturn_during_Equinox.jpg',
  'uranus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/500px-Uranus2.jpg',
  'neptune': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829777351748%29.png/500px-Neptune_-_Voyager_2_%2829777351748%29.png',
  'moon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/500px-FullMoon2010.jpg',
  'pluto': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Pluto-01_Stern_03_Pluto_Color_TXT.jpg/500px-Pluto-01_Stern_03_Pluto_Color_TXT.jpg'
};

const outDir = path.join(__dirname, '../public/textures/objects');

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'LearningJemz/2.0 (learningjemz@example.com)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
      }
      
      const file = fs.createWriteStream(dest);
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

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  for (const [name, url] of Object.entries(curatedImages)) {
    try {
      const destPath = path.join(outDir, `${name}.jpg`);
      console.log(`Downloading curated ${name}...`);
      await downloadImage(url, destPath);
      console.log(`Saved ${name}.jpg`);
      await sleep(1000); // 1 second delay to respect rate limit
    } catch (err) {
      console.error(`Failed ${name}:`, err.message);
    }
  }
}

run();
