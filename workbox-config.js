// to generate the public sw run - workbox injectManifest
// ps: make sure you have the workbox cli installed
module.exports = {
  "globDirectory": "public/",
  "globPatterns": [
    "**/*.{json,png,ico,svg,jpg,html}"
  ],
  "swDest": "public/sw.js",
  "swSrc": "src/sw.js"
};