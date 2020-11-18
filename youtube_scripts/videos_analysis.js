const datasetJsonFilePath = './dataset.json';

const dataset = require(datasetJsonFilePath);
const numberOfShows = 125;

const numberOfVideos = Object.values(dataset).flat(1).length;
const averageVideoNumberForShow = numberOfVideos/numberOfShows;

console.log(`Number of collected videos: ${numberOfVideos}`);
console.log(`Average number of videos collected for show: ${averageVideoNumberForShow}`);
