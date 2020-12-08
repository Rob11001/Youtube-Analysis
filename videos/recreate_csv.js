const fs = require('fs');

const datasetJsonFilePath = './dataset.json';
const datasetCsvFilePath = './videos/dataset.csv';

const showsData = require(datasetJsonFilePath);
const keys = ['id', 'title', 'publishedAt','views', 'likes', 'dislikes', 'comments'];

// Used to solve a problem in cvs file

const fd = fs.openSync(datasetCsvFilePath, 'w');
  Object.keys(showsData).forEach(key => {
    showsData[key].forEach(videoInfo => {
      let line = keys.reduce((string, current) => {
        return string += `;${(videoInfo[current] == undefined) ? null : videoInfo[current]}`;
      }, key);
      fs.writeSync(fd, `${line}\n`); 
    })
  });

  fs.close(fd, (err) => {
    if (err)
      console.log(err);
  });
