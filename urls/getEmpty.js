const categorizedUrls = require('./categorizedUrls.json');
const emptyUrls = './urls/emptyUrls.json';
const fs = require('fs');
const empty = [];

categorizedUrls.forEach(item => {
    item.urls.forEach((url) => {
        if(url.categories.length == 0 && !empty.includes(url.url)) {
            empty.push(url.url);
        }
    });
});



fs.writeFileSync(emptyUrls, JSON.stringify(empty, null, 2), {encoding: 'utf-8'});



