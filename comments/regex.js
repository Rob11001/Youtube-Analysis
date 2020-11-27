// credits to https://github.com/kevva/url-regex
'use strict';
const ipRegex = require('ip-regex');
const tlds = require('tlds');

const protocol = `(?:(?:[a-z]+:)?//)?`;
const auth = '(?:\\S+(?::\\S*)?@)?';
const ip = ipRegex.v4().source;
const host = '(?:(?:[a-z\\u00a1-\\uffff0-9][-_]*)*[a-z\\u00a1-\\uffff0-9]+)';
const domain = '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
const tld = `(?:\\.(?:${tlds.sort((a, b) => b.length - a.length).join('|')}))\\.?`;
const port = '(?::\\d{2,5})?';
const path = '(?:[/?#][^\\s"]*)';
const regex = `(?:${protocol}|www\\.)${auth}(?:localhost|${ip}|${host}${domain}${tld})${port}${path}`;

const regexObj = new RegExp(regex, 'ig');

module.exports = regexObj;