"use strict";

let mysql = require('mysql');
const config = require('./config.json');
let pool = mysql.createPool(config);
module.exports = pool;