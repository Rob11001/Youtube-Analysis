const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const dataApiKey = process.env.DATA_API_KEY;
const dataset = require('../videos/dataset.json');
const datasetTemp = {};

const shows = Object.keys(dataset);

const instance = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3/',
    params: {
      key: dataApiKey
    }
  });


const check = async () => {

    for(let i = 0; i < shows.length; i++) {
        let videos = dataset[shows[i]];
        datasetTemp[shows[i]] = [];
        console.log(`Processing ${i+1}/${shows.length} -> ${shows[i]}`);

        for(let j = 0; j < videos.length; j++) { 
            
            try {
                const response = await instance.request({
                    url: 'commentThreads',
                    params: {
                    part: "replies",
                    maxResults: 100,
                    videoId: videos[j].id,
                    }
                });
            } catch (err) {
                const error = err.response.data.error;
                if(error.code == 403 && error.message.includes('disabled comments')) {
                    datasetTemp[shows[i]].push(videos[j].id);
                }    
            }
        }
    }

};

check()
    .then(() => {
        Object.keys(datasetTemp).forEach((show) => {
            console.log(`${show}: ${datasetTemp[show].length}/${dataset[show].length}`);
            dataset[show] = dataset[show].filter((video) => !(datasetTemp[show].includes(video.id)) ); 
        });

        fs.writeFileSync(`./comments/filteredDataset.json`, JSON.stringify(dataset, null, 2));
    })
    .catch((err) => console.log(err));
