
let request = require('request');
let cheerio = require('cheerio');
let pool = require('./mysql');
let bloomfilter = require('bloom-filter-x');

function crowler() {
    pool.query('select url from audio order by id desc limit 5000', (err, result) => {
        result.forEach((v) => {
            bloomfilter.add(v.url)
        });
    });
    request.get('http://news.ifeng.com', (err, header, body) => {
        let data = getDate(body);
        insertData(parseData(data));
    });
}
//lodash   布隆过滤器

function getDate(body) {
    let $ = cheerio.load(body);
    let est =$('.left_co3').nextAll('script').eq(0).html().trim();
    est = JSON.parse(est.slice(est.indexOf('[')));
    let list =$('.left_co3').nextAll('script').eq(1).html().trim();
    list = JSON.parse(list.slice(list.indexOf('[')).slice(0, -1));
    list.splice(2, 0, est);
    return list;
};

function parseData(data) {
    let r = [];
    data.forEach((arr, i) => {
        arr.forEach(v => {
            let t = Array.isArray(v.thumbnail) ? v.thumbnail[0] : v.thumbnail;
            if (bloomfilter.add(v.url)) {
                r.push([t, v.title, v.url, i + 1]);
            }
        })
    });
    return r;
}

function insertData(data) {
    if (data.length) {
        let url = 'insert into audio (thumbnail,title,url,cate) values  ?';
        pool.query(url, [data], (err, result) => {
            if (err) {
                console.log(err.message)
            } else {
                console.log(result.affectedRows)
                // pool.end()
            }
        })
    } else {
        console.log('no new data');
    }
}
module.exports=crowler;