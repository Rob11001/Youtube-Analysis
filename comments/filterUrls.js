/**
 * Script to filter urls removing yt-urls and duplicate
 */
const fs = require('fs');
const commentsDatasetJsonFilePath = './commentsDataset.json';

const filteredDatasetFilePath = './comments/filtered.json';

const dataset = require(commentsDatasetJsonFilePath);
const showNames = Object.keys(dataset);

let filteredUrls = [];
let filteredUrlsCount = 0;

// Collects all yt urls
showNames.forEach((show) => {
  dataset[show].forEach(video => {
    const notYoutubeUrls = video.urls.filter(url => !(url.includes('youtube.com') || url.includes('youtu.be')));
    if (notYoutubeUrls.length > 0) {
      filteredUrlsCount += notYoutubeUrls.length;
      filteredUrls.push({id: video.videoId, urls: notYoutubeUrls});
    }
  });
});

console.log(`Url rimasti: ${filteredUrlsCount} filtrando Youtube`);

fs.writeFileSync(filteredDatasetFilePath, JSON.stringify(filteredUrls, null, 2), {encoding: 'utf-8'});


