const puppeteer = require("puppeteer");
const request = require('request');
var http=require('http');
var fs = require('fs');
var bodyparser=require('body-parser');
var urlencoded=bodyparser.urlencoded({extended:true});
var express=require('express');
var app=express();
var port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set("views",__dirname);

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

app.get('/',function(req,res){
    res.sendFile(__dirname+'/'+'index.html');
})
app.post('/photo',urlencoded,function(req,res){
    var user = req.body.user;
   var download = function(uri, filename, callback){
        request.head(uri, function(err, res, body){
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };
(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
    '--disable-setuid-sandbox' ]
    });
    var page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768});
    await page.goto(`https://instagram.com/`.concat(user),{waitUntil: 'load', timeout: 0});  
    try {
        await page.waitForSelector('img', {timeout:5000});
        const imageUrl = await page.evaluate(() => document.querySelectorAll("img")[0].src);
        debugger;
        await browser.close();
        download(imageUrl, "image.png", function(download) {
                var Jimp = require('jimp');
                Jimp.read('image.png', (err, lenna) => {
                if (err) throw err;
                lenna
                    .resize(320,Jimp.AUTO) 
                    .quality(90)
                    .write('output.png'); 
                });
        res.sendFile(__dirname+'/'+'download.html');
        }); 
    } 
    catch (error) {
        res.sendFile(__dirname+'/'+'error.html');
    }
})(); 
})

app.post("/download",function(req,res){
    var image = "output.png";
    res.download(image);
})

app.listen(port);