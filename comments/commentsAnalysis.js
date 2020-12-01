const fs = require('fs');
const commentsDatasetJsonFilePath = './commentsDataset.json';
const commentsDatasetCsvFilePath = './comments/comments.csv';

const commentsDataset = require(commentsDatasetJsonFilePath);

/*
    csv structure:
    showName, videoid, #urls
*/

const fd = fs.openSync(commentsDatasetCsvFilePath, "w");
let totUrlsCollected = 0;
let videosWithUrls = 0;

Object.keys(commentsDataset).forEach((showName) => {
    commentsDataset[showName] = commentsDataset[showName].reduce((unique, item) => {
        return unique.some((el) => el.videoId == item.videoId) ? unique : [...unique, item];
    }, []);
    commentsDataset[showName].forEach(({videoId, urls}) => {
        if(urls.length > 0) {
            videosWithUrls++;
            totUrlsCollected += urls.length;
            fs.writeSync(fd, `${showName};${videoId};${urls.length}\n`);
        }
    });
});

fs.close(fd, (err) => {
    if(err)
        console.log(err)
});

console.log(`# videos with urls: ${videosWithUrls}\n# urls: ${totUrlsCollected}`);
