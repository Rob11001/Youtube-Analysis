const categorizedUrls = require('./categorizedUrls.json');
const categoriesPath = './urls/categories.json';
const fs = require('fs');
let categories = [];

categorizedUrls.forEach(item => {
    item.urls.forEach((url) => {
        if(url.categories.length > 0) {
            categories = categories.concat(url.categories);
        }
    });
});

let set = new Set(categories);
categories = Array.from(set);

fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2), {encoding: 'utf-8'});



