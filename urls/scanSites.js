const axios = require('axios');
const fs = require('fs');
const urlsList = require('./urls.json');
require('dotenv').config();

//    Only for DEBUG
/*process.stdin.resume();
process.on('SIGINT', function() {
  saveData();
  process.exit();
});
*/

// Global variables
const virus_total_key = process.env.VIRUS_TOTAL_API_KEY;

// Prebuilt istance for axios get calls
const instance = axios.create({
    baseURL: 'https://www.virustotal.com/api/v3/',
    headers: { 'x-apikey': virus_total_key }
});

const saveData = () => {
    fs.writeFileSync('./urls/urls.json', JSON.stringify(urlsList, null, 2), {encoding: 'utf-8'});
};

const analyze = (url) => {
    // Gestire il problema della quota
    // Prima chiamata /urls per l'id (POST: url: url)
    // Seconda chiamata /analyses/{id} (GET)
};