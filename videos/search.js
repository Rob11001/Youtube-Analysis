/**
 * Script to collect the first most relevant 10 videos for each show and save their statistics in a json file and a csv file
 * 
 * json structure:
 *    {
 *      "showName": [
 *                    {
                        "id": 'videoId',
                        "title": 'Title of the video',
                        "publishedAt": 'Date of publication',
                        "views": '# of views',
                        "likes": '# of likes',
                        "dislikes": '# of dislikes',
                        "comments": '# of comments'
                      },
                      ...
 *                  ]
 *    }
 * 
 */
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Global variables
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

// Prebuilt istance for axios get calls
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

      // To collect the first ten videos with comments
      while(count < 10) {
      
        // Search YT API to collect videos
        const response = await instance.request({
          url: 'search',
          params: {
            part: "snippet",
            maxResults: 50,
            q: showName,
            regionCode: 'US',
            type: 'video',
            pageToken: nextPageToken,
          }
        });

        nextPageToken = response.data.nextPageToken;

        for (let item of response.data.items) {
          // Videos YT API to collect statistics for each video
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
              // CommentThreads YT API to verify the real precence of comments
              const response = await instance.request({
                url: 'commentThreads',
                params: {
                part: "replies",
                maxResults: 100,
                videoId: video.id,
                }
              });
              
              let found = tempShows.filter((el) => el.id === video.id).length;  // To avoid duplicate
              
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
                throw err; // Propagation of the error to stop the execution
              }
            }

          }
      
          if (count === 10)
            break;

        }

        showsData[showName] = tempShows;
        
        console.log(`Show ${showName} data collected - #videos: ${count}`);
        console.log(`nextPageToken: ${nextPageToken}`);
        
        if (nextPageToken == undefined)   // Pages ended
          break;
      }

    } catch (err) {
      fs.writeFileSync(`./videos/${historyFilePath}`, JSON.stringify({showCounter: i}, null, 2)); // Save the current show
      console.log(err.message);
      if(err.response)                                                            // To avoid undefined exception
        console.log(`Response data error: ${err.response.data.error.message}`);
      break; // To skip for cycle
    }
   
  }
}

extractData()
  .then(() => {

  // Saving JSON and cvs files
  
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