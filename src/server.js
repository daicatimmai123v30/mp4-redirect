const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();


app.use(express.json({ limit: "100kb" }));



const PORT = process.env.PORT || 8010;
const API_KEY = process.env.API_KEY;




const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "links.json");

fs.mkdirSync(DATA_DIR, { recursive: true });

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "{}");
}

function readLinks() {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}


// Redirect to original video
app.get("/:slug.mp4", (req, res) => {
    const { slug } = req.params;
    const userAgent = req.headers['user-agent'] || '';


    const links = readLinks();
    const safeDestination = links[`${slug}.mp4`];
    console.log(links, slug)
    // Kiểm tra nếu là Twitterbot
    if (userAgent.includes('Twitterbot')) {
        res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="referrer" content="origin">
            <meta name="robots" content="noindex, nofollow">
            <meta http-equiv="refresh" content="0;url=${safeDestination}">
            <title>Đang chuyển hướng</title>
            <script>
                (function () {
                var target = "${safeDestination}";
                window.location.replace(target);
                })();
            </script>
        </head>
        <body data-net-handoff="1">
            <a id="continue-link" href="${safeDestination}" rel="nofollow">Tiếp tục</a>
        </body>
        </html>
    `);
    } else {
        // Chuyển hướng phía server cho người dùng
        res.redirect(301, safeDestination);
    }
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});


// Route cho robots.txt (cho Twitterbot)
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: Twitterbot\nDisallow:');
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`MP4 Redirect running on port ${PORT}`);
});


