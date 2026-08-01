const https = require('https');
const fs = require('fs');
const path = require('path');

const baseUrl = "https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cburnett/";

const pieceMap = {
    "w_k.svg": "wK.svg",
    "w_q.svg": "wQ.svg",
    "w_r.svg": "wR.svg",
    "w_b.svg": "wB.svg",
    "w_n.svg": "wN.svg",
    "w_p.svg": "wP.svg",
    "b_k.svg": "bK.svg",
    "b_q.svg": "bQ.svg",
    "b_r.svg": "bR.svg",
    "b_b.svg": "bB.svg",
    "b_n.svg": "bN.svg",
    "b_p.svg": "bP.svg"
};

const options = {
    headers: {
        'User-Agent': 'NodeJS/14.0'
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
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                https.get(response.headers.location, options, (res) => {
                    res.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
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
    console.log("Downloading chess pieces from Lichess repo...");
    for (const [localName, remoteName] of Object.entries(pieceMap)) {
        try {
            await download(localName, baseUrl + remoteName);
            console.log(`Downloaded ${localName}`);
        } catch (e) {
            console.error(e.message);
        }
    }
    console.log("Done!");
}

downloadAll();
