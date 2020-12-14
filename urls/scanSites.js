const axios = require('axios');
const fs = require('fs');
const urlsList = require('./urls.json');
const FormData = require('form-data');
require('dotenv').config();

process.stdin.resume();
process.on('SIGINT', function() {
  saveData();
  process.exit();
});

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const saveData = () => {
    fs.writeFileSync('./urls/urls.json', JSON.stringify(urlsList, null, 2), {encoding: 'utf-8'});
};

const computeThreat = (stats) => {
    const total = Object.keys(stats).reduce((total, key) => {
        return total += stats[key];
    }, 0);

    if (total === 0)
        return 'Undetected';
    
    const rates = [stats.harmless, stats.malicious, stats.suspicious].map(el => el / total);
    const max = Math.max(...rates); 
    if (max === 0) 
        return 'Undetected';

    switch (rates.indexOf(max)) {
        case 0: return 'Harmless';
        case 1: return 'Malicious';
        case 2: return 'Suspicious';
    }
}

// Global variables
const virus_total_key = process.env.VIRUS_TOTAL_API_KEY;

const analysesIds = {};
let waitingMultiplier = 1;
const analyze = async (url) => {

    try {
        let analysesId = analysesIds[url];

        if (analysesId == undefined) {

            const formData = new FormData();
            formData.append('url', url);

            // chiamata all'endpoint /urls che analizza l'url
            const urlsResponse = await axios.post('https://www.virustotal.com/api/v3/urls', 
                formData, 
                { headers: formData.getHeaders({'x-apikey': virus_total_key}) }
            );

            analysesId = urlsResponse.data.data.id;
            waitingMultiplier = 1;
            console.log(`Analyses id for ${url}: ${analysesId}`);
        }

        await sleep(3500);
        const analysesResponse = await axios.get(`https://www.virustotal.com/api/v3/analyses/${analysesId}`, 
            {headers: { 'x-apikey': virus_total_key }}
        );

        const analyses = analysesResponse.data.data;

        if (analyses.attributes.status === 'completed') {
            return computeThreat(analyses.attributes.stats);
        } else {
            console.log(`Analyses for ${url} not completed, waiting...`);
            await sleep(3000 * waitingMultiplier);
            analysesIds[url] = analysesId;
            waitingMultiplier += 0.5;
            return await analyze(url);
        }


    } catch (err) {
        if (err.response) {
            const error = err.response.data.error;
            if (error.code === 'QuotaExceededError') {
                console.log(`Error ${error.code}: ${error.message}`);
                await sleep(20000);
                return await analyze(url);
            } else {
                throw error;
            }
        } else {
            throw err;
        }
    }
};

const main = async () => {
    for (let site of urlsList) {
        if (site.rating === null) {
            site.rating = await analyze(site.url);
        }
    }    
}

main()
    .then(() => {
        console.log('All analyses completed');
    })
    .catch((err) => {
        console.log(err);
    })
    .finally(() => {
        saveData();
    });