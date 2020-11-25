const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const dataApiKey = process.env.DATA_API_KEY;
const historyFilePath = './history.json';
const datasetJsonFilePath = '../data/dataset.json';


let history;
try {
  history = require(historyFilePath);
} catch (err) {
  history = null;
}

const dataset = require(datasetJsonFilePath);
const showNames = Object.keys(dataset);
let showCounter = history === null ? 0 : history.showCounter;


const instance = axios.create({
  baseURL: 'https://www.googleapis.com/youtube/v3/',
  params: {
    key: dataApiKey
  }
});

const urlRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

retrieveComments = async () => {
  
  for (let i = showCounter; i  < showNames.length; i++) {
    try {

      for (video of dataset[showNames[i]]) {  // for each video in the list relative to a show
        
        nextPageToken = undefined;
        do {
          const response = await instance.request({
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
          nextPageToken = response.data.nextPageToken;

          const commentThreadList = response.data.items;
          commentThreadList.forEach(commentThread => {
            const topLevelComment = commentThread.snippet.topLevelComment.snippet.textDisplay;
            // rimuovere whitespace (quindi anche newline con \n) e testare la regex
            // prendere la lista di replies e fare lo stesso di sopra
          });
        } while (nextPageToken);
        
      } 

    } catch (error) { // to catch quota exceeded and other errors related to requests
      fs.writeFileSync(`./comments/${historyFilePath}`, JSON.stringify({showCounter: i}, null, 2));
      console.log(err.message);
      if(err.response)                                                            // To avoid undefined exception
        console.log(`Response data error: ${err.response.data.error.message}`);
      break;
    }
  }
}

// Salvare tutto!!!!