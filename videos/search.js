const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const dataApiKey = process.env.DATA_API_KEY;
const historyFilePath = './history.json';
const datasetJsonFilePath = './dataset.json';
const datasetCsvFilePath = './videos/dataset.csv';

let history;
try {
  history = require(historyFilePath);
} catch (err) {
  history = null;
}

let showCounter = history === null ? 0 : history.showCounter;

const shows = fs.readFileSync('./data/topShows.txt', {encoding: 'utf-8'}).replace(/\r?\n$/, '').split(/\r?\n/);
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
  
    try {
      let count = 0;
      let nextPageToken = undefined;
      let tempShows = [];

      while(count < 10) {
      
        const response = await instance.request({
          url: 'search',
          params: {
            part: "snippet",
            maxResults: 50,
            q: showName,
            regionCode: 'US',
            type: 'video',
            nextPageToken: nextPageToken,
          }
        });

        nextPageToken = response.data.nextPageToken;

        for (let item of response.data.items) {
          const response = await instance.request({
            url: 'videos',
            params: {
              part: "snippet,statistics",
              id: item.id.videoId
            }
          });
        
          const video = response.data.items[0];
          if (video.statistics.commentCount > 0 && video.statistics.viewCount && video.statistics.likeCount && video.statistics.dislikeCount && video.statistics.commentCount) {
            
            try {
              
              const response = await instance.request({
                url: 'commentThreads',
                params: {
                part: "replies",
                maxResults: 100,
                videoId: video.id,
                }
              });
              
              let found = tempShows.filter((el) => el.id === video.id).length;
              
              if(found == 0) {
                tempShows.push({
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
             
            } catch (err) {
              const error = err.response.data.error;
              if(error.code == 403 && !error.message.includes('disabled comments')) {
                throw err;
              }
            }

          }
      
          if (count === 10)
            break;

        }

        showsData[showName] = tempShows;
        
        console.log(`Show ${showName} data collected - #videos: ${count}`);
        console.log(`nextPageToken: ${nextPageToken}`);
        
        if(nextPageToken == undefined)
          break;
      }

    } catch (err) {
      fs.writeFileSync(`./videos/${historyFilePath}`, JSON.stringify({showCounter: i}, null, 2));
      console.log(err.message);
      console.log(`Response data error: ${err.response.data.error.message}`);
      break;
    }
   
  }
}

extractData()
  .then(() => {

  let dataset;
  try {
    dataset = require(datasetJsonFilePath);
    Object.keys(showsData).forEach(key => dataset[key] = showsData[key]);
    fs.writeFileSync(`./videos/${datasetJsonFilePath}`, JSON.stringify(dataset, null, 2));
  } catch (err) {
    fs.writeFileSync(`./videos/${datasetJsonFilePath}`, JSON.stringify(showsData, null, 2));
  }
  
  
  const keys = ['id', 'title', 'publishedAt','views', 'likes', 'dislikes', 'comments'];

  const fd = fs.openSync(datasetCsvFilePath, 'a');
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


  })
  .catch(err => console.log(err));
  