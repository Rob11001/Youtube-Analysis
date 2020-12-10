const {Builder, By, until} = require('selenium-webdriver');
const fs = require('fs');

const url = "https://sitereview.bluecoat.com/";
const videosUrlsDs = require('../comments/filtered.json');
const categorizedUrlsFilePath = './urls/categorizedUrls.json';
const categoriesForSiteFilePath = './urls/categoriesForSite.json';

let driver;

// Initialize Builder with Chrome Browser
const initialize = async () => {
    driver = await new Builder().forBrowser("chrome").build();
}

const needsCaptcha = async (site) => {
    const captcha = await driver.findElements(By.id("imgCaptcha"));
    if (captcha.length > 0) {
        console.log(`Asked CAPTCHA for site: ${site}`);
        return true
    }
    return false;
}

const categorize = async (site) => {
    await driver.get(url);
    
    await driver.sleep(2000);   // aspetta gli eventuali caricamenti della pagina    
    let input = await driver.findElement(By.id("txtUrl"));
    let button = await driver.findElement(By.id("btnLookup"));
    await input.sendKeys(site);
    await button.click();

    await driver.sleep(2000);
    if (await needsCaptcha(site)) {
        try { await driver.wait(until.elementLocated(By.id("txtUrl")), 10000); }
        catch(e) {}
        return await categorize(site);  // qui è necessario, altrimenti se va avanti non trova gli elementi html successivi
    }

    //await driver.wait(until.elementLocated(By.css("div.panel-body *.clickable-category")), 5000); rimossa per evitare try-catch
    let categories = await driver.findElements(By.css("div.panel-body *.clickable-category")); 

    if (categories.length == 0) {
        buttonsShortener = await driver.findElements(By.id("btnUrlShortener")); 
        if (buttonsShortener.length == 0) {
            console.log(`Category not found for site ${site} or url was wrong`);
        } 
        else {
            await buttonsShortener[0].click();
            await driver.sleep(2000);

            // await driver.wait(until.elementLocated(By.css("div.panel-body *.clickable-category")), 5000) vedi sopra
            categories = await driver.findElements(By.css("div.panel-body *.clickable-category"));
        }
    }

    return Promise.all(categories.map(e => e.getText()));
};


/** Generalizzare categorize per applicarla a tutti gli urls */
let categoriesForSite;
try {
    categoriesForSite = require('./categoriesForSite.json');
} catch (err) {
    categoriesForSite = {};
}
initialize()
    .then(async () => {        
        for (let j = 0; j < videosUrlsDs.length; j++) {
            let video = videosUrlsDs[j];
            console.log(`Video ${j + 1}/${videosUrlsDs.length + 1}`);
            for (let i = 0; i < video.urls.length; i++) {
                let site = video.urls[i];
                try {
                    if (categoriesForSite[site] == undefined) {
                        let siteCategories = await categorize(site);
                        categoriesForSite[site] = siteCategories;
                    }

                    video.urls[i] = {url: site, categories: categoriesForSite[site]};
                                        
                    console.log(`${site}: ${categoriesForSite[site]}`);
                } catch (err) {
                    console.log(`Error for site ${site}, message: ${err.message}`);
                }
            }
        }
    
    })
    .catch(err => console.log(err))
    .finally(async () => {
        fs.writeFileSync(categorizedUrlsFilePath, JSON.stringify(videosUrlsDs, null, 2), {encoding: 'utf-8'});
        fs.writeFileSync(categoriesForSiteFilePath, JSON.stringify(categoriesForSite, null, 2), {encoding: 'utf-8'});
        await driver.close()
    });
