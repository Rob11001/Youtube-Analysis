const {Builder, By, until} = require('selenium-webdriver');

const url = "https://sitereview.bluecoat.com/";
const sites = require('../comments/filtered.json');

let driver;

// Initialize Builder with Chrome Browser
const initialize = async () => {
    driver = await new Builder().forBrowser("chrome").build();
}

const categorize = async (site) => {
    await driver.get(url);
    let input = await driver.findElement(By.id("txtUrl"));
    let button = await driver.findElement(By.id("btnLookup"));
    await input.sendKeys(site);
    await button.click();
    let categories;
    
    try {
        categories = await driver.wait(until.elementsLocated(By.css("div.panel-body *.clickable-category")), 5000);
    } catch(err) {
        try {
            button = await driver.findElement(By.id("btnUrlShortener"));
            await button.click();
            categories = await driver.wait(until.elementsLocated(By.css("div.panel-body *.clickable-category")), 5000);
        } catch(err) {
            let resolve = (msg) => msg;
            let reject = resolve;
            return new Promise((resolve, reject) => {
                let message = err.message;
                return resolve(message);
            });    
        }
    }

    return Promise.all(categories.map(e => e.getText()));
};


/** Generalizzare categorize per applicarla a tutti gli urls */

initialize()
    .then(async () => {
        
    
    })
    .catch(err => console.log(err));
