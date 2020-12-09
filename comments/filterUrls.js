/**
 * Script to filter urls removing yt-urls and duplicate
 */
const fs = require('fs');
const commentsDatasetJsonFilePath = './commentsDataset.json';

const filteredDatasetFilePath = './comments/filtered.json';

const dataset = require(commentsDatasetJsonFilePath);
const showNames = Object.keys(dataset);

let filteredUrls = {};

// Collects all yt urls
showNames.forEach((show) => {
  filteredUrls[show] = [];
  dataset[show].forEach(video => {
    if (video.urls.length > 0)
      filteredUrls[show] = filteredUrls[show].concat(video.urls.filter(url => !(url.includes('youtube.com') || url.includes('youtu.be'))));
  });
});

filteredUrlsCount = 0;
showNames.forEach((show) => {
  // Removes duplicate in filtered urls
  filteredUrls[show] = filteredUrls[show].reduce((unique, item) => {
    if(unique.some((el) => el === item))
      return unique;
    filteredUrlsCount++;
    return [...unique, item];
  }, []);
});


console.log(`Url unici rimasti: ${filteredUrlsCount} filtrando Youtube`);

fs.writeFileSync(filteredDatasetFilePath, JSON.stringify(filteredUrls, null, 2), {encoding: 'utf-8'});


