const fs = require('fs');
const commentsDatasetJsonFilePath = './commentsDataset.json';

const filteredDatasetFilePath = './comments/filtered.json';

const dataset = require(commentsDatasetJsonFilePath);
const showNames = Object.keys(dataset);

let filteredUrls = [];

// Collects all yt urls
showNames.forEach((show) => {
  dataset[show].forEach(video => {
    if (video.urls.length > 0)
      filteredUrls = filteredUrls.concat(video.urls.filter(url => !(url.includes('youtube.com') || url.includes('youtu.be'))));
  });
});

// Removes duplicate in filtered urls
filteredUrls = filteredUrls.reduce((unique, item) => {
  return unique.some((el) => el === item) ? unique : [...unique, item];
}, []);

console.log(`Url unici rimasti: ${filteredUrls.length} filtrando Youtube`);

fs.writeFileSync(filteredDatasetFilePath, JSON.stringify(filteredUrls, null, 2), {encoding: 'utf-8'});


