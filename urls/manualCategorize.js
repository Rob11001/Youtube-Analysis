const fs = require('fs');
const {Builder} = require('selenium-webdriver');
const prompt = require('prompt-sync')();
const categorizedUrls = require('./categorizedUrls.json');
const categoriesForSite = require('./categoriesForSite.json');

const categorizedUrlsFilePath = './urls/categorizedUrls1.json';
const categoriesForSiteFilePath = './urls/categoriesForSite1.json';


let driver;

// Initialize Builder with Chrome Browser
const initialize = async () => {
    driver = await new Builder().forBrowser("chrome").build();
}

const manualCategorize = async (url) => {
  if (!url.includes('http'))
    url = `http://${url}`; 

  try {
    await driver.get(url);
  } catch (err) {
    console.log(err);
  }

  let categories = prompt('Categories (separated by a comma): ');
  categories = categories.split(',').map(str => str.trim());

  return categories;
};

initialize()
    .then(async () => {    
      for (let video of categorizedUrls) {
        for (let url of video.urls) {
          if (url.categories.length == 0) {
            if (categoriesForSite[url.url].length == 0) {
              console.log(url.url);
              let siteCategories = await manualCategorize(url.url);
              categoriesForSite[url.url] = siteCategories;
            }
            url.categories = categoriesForSite[url.url];
          }
        }
      }
    })
    .catch(err => console.log(err))
    .finally(async () => {
        fs.writeFileSync(categorizedUrlsFilePath, JSON.stringify(categorizedUrls, null, 2), {encoding: 'utf-8'});
        fs.writeFileSync(categoriesForSiteFilePath, JSON.stringify(categoriesForSite, null, 2), {encoding: 'utf-8'});
        await driver.close()
    });
