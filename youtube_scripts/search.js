const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const dataApiKey = process.env.DATA_API_KEY;
const historyFilePath = './youtube_scripts/history.json';
const datasetJsonFilePath = './youtube_scripts/dataset.json';
const datasetCsvFilePath = './youtube_scripts/dataset.csv';

let history;
try {
  history = require(historyFilePath);
} catch (err) {
  history = null;
}

let showCounter = history === null ? 0 : history.showCounter;

const shows = fs.readFileSync('./topShows.txt', {encoding: 'utf-8'}).replace(/\r?\n$/, '').split(/\r?\n/);
const showsData = {};

const instance = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3/',
  params: {
    key: dataApiKey
  }
});

extractData = async () => {
  for (let i = showCounter; i < shows.length; i++) {
    const showName = shows[i];
  
    const response = await instance.request({
      url: 'search',
      params: {
        part: "snippet",
        maxResults: 50,
        q: showName,
        regionCode: 'US',
        type: 'video'
      }
    });
  
    if (response.status !== 200) {
      fs.writeFileSync(historyFilePath, JSON.stringify({showCounter: i}, null, 2));
      console.log(response);
      break;
    }
  
    showsData[showName] = [];
  
    let count = 0;
    let wentBad = false;
    for (let item of response.data.items) {
      const response = await instance.request({
        url: 'videos',
        params: {
          part: "snippet,statistics",
          id: item.id.videoId
        }
      });
  
      if (response.status !== 200) {
        fs.writeFileSync(historyFilePath, JSON.stringify({showCounter: i}, null, 2));
        console.log(response);
        wentBad = true;
        break;
      }
    
      const video = response.data.items[0];
      if (video.statistics.commentCount > 0) {
        showsData[showName].push({
          id: video.id,
          title: video.snippet.title,
          publishedAt: video.snippet.publishedAt,
          views: video.statistics.viewCount,
          likes: video.statistics.likeCount,
          dislikes: video.statistics.dislikeCount,
          comments: video.statistics.commentCount
        })
        count++;
      }
  
      if (count === 10)
        break;
    
    }
  
    if (wentBad)
      break;
    
    console.log(`Show ${showName} data collected - #videos: ${count}`)
  }
}

extractData()
  .then(() => {

  let dataset;
  try {
    dataset = require(datasetJsonFilePath);
    Object.keys(showsData).forEach(key => dataset[key] = showsData[key]);
    fs.writeFileSync(datasetJsonFilePath, JSON.stringify(dataset, null, 2));
  } catch (err) {
    fs.writeFileSync(datasetJsonFilePath, JSON.stringify(showsData, null, 2));
  }
  
  
  const fd = fs.openSync(datasetCsvFilePath, 'a');
  Object.keys(showsData).forEach(key => {
    showsData[key].forEach(videoInfo => {
      let line = Object.values(videoInfo).reduce((string, current) => {
        return string += `,${current}`;
      }, key);
      fs.writeSync(fd, `${line}\n`); 
    })
  });

  fs.close(fd, (err) => console.log(err));

  })
  .catch(err => console.log(err));