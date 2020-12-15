'use strict'
const fs = require('fs');
const categorizedUrls = require('./categorizedUrls.json');
const filePath = './urls/categorizedUrls.csv';

const createLine = (videoId, url, category) => {
    return `${videoId};${url};${category}\n`;
}

const main = () => {
    const fd = fs.openSync(filePath, 'w');

    for(let video of categorizedUrls) 
        for(let url of video.urls) 
            for(let category of url.categories) {
                let line = createLine(video.id, url.url, category);
                fs.writeSync(fd, line);
            }
            
    fs.closeSync(fd);
};

main();