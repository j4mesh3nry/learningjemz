const https = require('https');
const fs = require('fs');
const path = require('path');

const pieces = {
    "w_k.svg": "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
    "w_q.svg": "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
    "w_r.svg": "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
    "w_b.svg": "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_blt45.svg",
    "w_n.svg": "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
    "w_p.svg": "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
    "b_k.svg": "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
    "b_q.svg": "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
    "b_r.svg": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
    "b_b.svg": "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
    "b_n.svg": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
    "b_p.svg": "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg"
};

const options = {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
};

const download = (filename, url) => {
    return new Promise((resolve, reject) => {
        const dest = path.join(__dirname, 'src', 'assets', 'pieces', filename);
        const file = fs.createWriteStream(dest);
        https.get(url, options, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            }
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

async function downloadAll() {
    console.log("Downloading chess pieces...");
    for (const [filename, url] of Object.entries(pieces)) {
        try {
            await download(filename, url);
            console.log(`Downloaded ${filename}`);
        } catch (e) {
            console.error(e.message);
        }
    }
    console.log("Done!");
}

downloadAll();
