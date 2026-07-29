const fs = require('fs');

const islandGroups = {
  luzon: [
    'abra', 'apayao', 'benguet', 'ifugao', 'kalinga', 'mountain-province', // CAR
    'ilocos-norte', 'ilocos-sur', 'la-union', 'pangasinan', // I
    'batanes', 'cagayan', 'isabela', 'nueva-vizcaya', 'quirino', // II
    'aurora', 'bataan', 'bulacan', 'nueva-ecija', 'pampanga', 'tarlac', 'zambales', // III
    'batangas', 'cavite', 'laguna', 'quezon', 'rizal', // IV-A
    'marinduque', 'occidental-mindoro', 'oriental-mindoro', 'palawan', 'romblon', // IV-B
    'albay', 'camarines-norte', 'camarines-sur', 'catanduanes', 'masbate', 'sorsogon' // V
  ],
  visayas: [
    'aklan', 'antique', 'capiz', 'guimaras', 'iloilo', 'negros-occidental', // VI
    'bohol', 'cebu', 'negros-oriental', 'siquijor', // VII
    'biliran', 'eastern-samar', 'leyte', 'northern-samar', 'samar', 'southern-leyte' // VIII
  ],
  mindanao: [
    'zamboanga-del-norte', 'zamboanga-del-sur', 'zamboanga-sibugay', // IX
    'bukidnon', 'camiguin', 'lanao-del-norte', 'misamis-occidental', 'misamis-oriental', // X
    'davao-de-oro', 'davao-del-norte', 'davao-del-sur', 'davao-oriental', 'davao-occidental', // XI
    'cotabato', 'sarangani', 'south-cotabato', 'sultan-kudarat', // XII
    'agusan-del-norte', 'agusan-del-sur', 'dinagat-islands', 'surigao-del-norte', 'surigao-del-sur', // XIII
    'basilan', 'lanao-del-sur', 'maguindanao-del-norte', 'maguindanao-del-sur', 'sulu', 'tawi-tawi' // BARMM
  ]
};

const formatName = (id) => id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

let provinces = [];
let index = 0;

for (let ig in islandGroups) {
  const list = islandGroups[ig];
  const total = list.length;
  
  let startY = 0;
  if (ig === 'visayas') startY = 400;
  if (ig === 'mindanao') startY = 600;
  
  let cols = 6;
  
  list.forEach((id, i) => {
    let row = Math.floor(i / cols);
    let col = i % cols;
    
    let x = 50 + col * 70;
    let y = startY + 50 + row * 60;
    
    provinces.push({
      id: id,
      name: formatName(id),
      capital: formatName(id) + ' City',
      region: 'Region ' + (Math.floor(Math.random() * 10) + 1),
      island_group: ig.charAt(0).toUpperCase() + ig.slice(1),
      area_km2: Math.floor(Math.random() * 10000) + 1000,
      population: Math.floor(Math.random() * 2000000) + 100000,
      fun_fact: 'Fun fact about ' + formatName(id),
      path: `M ${x} ${y} L ${x+60} ${y} L ${x+60} ${y+50} L ${x} ${y+50} Z`,
      center_x: x + 30,
      center_y: y + 25
    });
  });
}

const dir = 'C:\\projectvc\\learningjemz\\src\\data';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const out = `const provinces = ${JSON.stringify(provinces, null, 2)};\n\nexport default provinces;`;
fs.writeFileSync(dir + '\\philippines-provinces.js', out);
console.log('Done');
