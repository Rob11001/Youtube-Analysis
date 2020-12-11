const categoriesForSite = require('./categoriesForSite.json');
const fs = require('fs');
const path = './urls/urls.json';

const urls = Object.keys(categoriesForSite).map((el) => {
    return {
        url: el,
        rating: null,
    }
});

fs.writeFileSync(path, JSON.stringify(urls, null, 2), {encoding: 'utf-8'});
