const axios = require('axios');
const fs = require('fs');
const urlRegex = require('./regex');
require('dotenv').config();

const dataApiKey = process.env.DATA_API_KEY;
const historyFilePath = './history.json';
const datasetJsonFilePath = '../data/dataset.json';
const commentsDatasetJsonFilePath = './commentsDataset.json';

//    Only for DEBUG
/*process.stdin.resume();
process.on('SIGINT', function() {
  saveData();
  process.exit();
});
*/

let history;
try {
  history = require(historyFilePath);
} catch (err) {
  history = null;
}

const dataset = require(datasetJsonFilePath);
const showNames = Object.keys(dataset);
let showCounter = history === null ? 0 : history.showCounter;
let showVideoCounter = history === null ? 0 : history.showVideoCounter;
let unavailableVideos = 0;

const instance = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3/',
  params: {
    key: dataApiKey
  }
});

const commentsDataset = {};

retrieveComments = async () => {
  console.log(`${showCounter},${showVideoCounter}`);
  for (let i = showCounter; i  < showNames.length; i++) {
    let j;
    try {
      commentsDataset[showNames[i]] = [];

      for (j = showVideoCounter; j < dataset[showNames[i]].length; j++) {  // for each video in the list relative to a show
        const video = dataset[showNames[i]][j];
        nextPageToken = undefined;
        let tempUrls = [];
        const tempComments = [];   // temporary data structure to gather all comments containing urls

        do {
          let response;

          try {
            response = await instance.request({
              url: 'commentThreads',
              params: {
                part: 'snippet, replies',
                videoId: video.id,
                maxResults: 100,
                order: 'relevance',
                pageToken: nextPageToken,
                textFormat: 'plainText'
              }
            });
          } catch (err) {
            console.log(err.message);

            if (err.response) {     // To avoid undefined exception
              const message = err.response.data.error.message;
              if (err.response.status == 404 || message.includes('disabled comments')) {
                unavailableVideos++;
                break;
              } else {
                console.log(`Response data error: ${message}`);
                throw err;
              }        
            }
            throw err;
          }
          
          nextPageToken = response.data.nextPageToken;

          const commentThreadList = response.data.items;
          commentThreadList.forEach(commentThread => {
            const topLevelComment = commentThread.snippet.topLevelComment.snippet.textDisplay;
            const replies = commentThread.replies?.comments || [];

            const topLevelAndReplies = replies.map((comment) => comment.snippet.textDisplay).concat([topLevelComment]); // grab all comments

            topLevelAndReplies.forEach((comment, index) => {
              const commentUrls = comment.match(urlRegex);
              if (commentUrls) {
                tempUrls = tempUrls.concat(commentUrls);
                tempComments.push(topLevelAndReplies[index]);    // saves the unmodified comment
              }
            });
          });
        } while (nextPageToken);

        // we save the comments into the final structure that we'll save later

        commentsDataset[showNames[i]].push({videoId: video.id, comments: tempComments, urls: tempUrls});

        console.log(`Found ${tempComments.length} comment(s) containing URLs, for Show: ${showNames[i]}, videoId: ${video.id}, index: ${j}`);

      }
      showVideoCounter = 0; // to reset the history counter after the first show (otherwise the j index would always start from there)

    } catch (err) { // to catch quota exceeded and other errors related to requests
      fs.writeFileSync(`./comments/${historyFilePath}`, JSON.stringify({showCounter: i, showVideoCounter: j}, null, 2));
      console.log(err);
      break;
    }
  }
}

const saveData = () => {
  try {
    const dataset = require(commentsDatasetJsonFilePath);
    Object.keys(commentsDataset).forEach(showName=> {
      if (dataset[showName] == undefined)
        dataset[showName] = [];

      dataset[showName] = dataset[showName].concat(commentsDataset[showName]);
    });
    fs.writeFileSync(`./comments/${commentsDatasetJsonFilePath}`, JSON.stringify(dataset, null, 2));
  } catch (err) {
    fs.writeFileSync(`./comments/${commentsDatasetJsonFilePath}`, JSON.stringify(commentsDataset, null, 2));
  }
};

retrieveComments()
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
    saveData();
    console.log(`Unavailable videos: ${unavailableVideos}`);
  });