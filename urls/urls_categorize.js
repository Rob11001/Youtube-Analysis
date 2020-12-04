const {Builder, By, until} = require('selenium-webdriver');

const url = "https://sitereview.bluecoat.com/";
let driver;

const prova = "startmovieschannel.blogspot.com/tt4823776/.html";



const initialize = async () => {
    driver = await new Builder().forBrowser("chrome").build();
}

const categorize = async () => {
    await driver.get(url);
    let input = await driver.findElement(By.id("txtUrl"));
    let button = await driver.findElement(By.id("btnLookup"));
    await input.sendKeys(prova);
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
    .then(() => {
        categorize()
            .then((webEls) => {
                console.log(webEls);
            })
            .finally(async () => {
                await driver.close();
            })
            .catch(err => console.log(err));
        })
    .catch(err => console.log(err));
