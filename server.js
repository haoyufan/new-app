"use strict";

let express = require('express');
const server = express();

let pool = require('./mysql');

let ejs= require('ejs');
let path = require('path');

let crawler = require('./crawler');

crawler();
setInterval(crawler,20*60*1000);

server.set('view-engine','html');
server.engine('html',ejs.renderFile);

server.use('/',express.static('./client'));
server.use('/static',express.static('./static'));

server.get('/load',(req,res)=>{
    let limit = 10;
    let sql = `select * from audio where cate = ? order by id desc limit ? offset ? `;
    pool.query(sql,[req.query.id,limit,(req.query.page-1)*limit],(err,result)=>{
        if(err){
            res.json(err.message);
        }else{
            if(result.length){
                res.json({state:200,data:result});
            }else{
                res.json({state:400})
            }
        }
    })
})

server.get('/*',(req,res)=>{
    console.log(`${res.socket.remoteAddress}   ${req.method} ${req.path}`);
   let id = req.query.id || 1;
   pool.query('select * from user ',(err,result)=>{
       pool.query('select * from audio where cate = ? order by id desc limit 10 offset 0 ',[id],(err,news)=>{
           res.render(path.resolve('./views/index.html'),{title:'新闻',result,news,id})
       })
   })
});

server.listen(18080,()=>{
    console.log('server is listening @18080')
});


//.gitignore