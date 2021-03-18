var express = require('express');
var bodyParser = require('body-parser');
var app = express();


const {Client} = require('pg');
const url = require('url');
const http = require('http')

var urlencodedParser = bodyParser.urlencoded({ extended: false});

app.set('view engine','ejs');

app.use(express.static(__dirname + '/css'));

app.get('/', function(req,res){

    res.render('index');
});

app.get('/shortURL', function(req,res){

    res.render('index');
});

app.post('/shortURL', urlencodedParser, function(req, response1){

    var res = '';
    const {Client} = require('pg');

    const db = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'URL',
        password: '123',
        port: 5432  
    });
    
    db.connect();
    var text = req.body.fURL;
    
    db.query('SELECT * FROM shorturl', (err, data) => {
        if (err) 
            throw new Error(err);
        
        console.log("sdsad");
                    
        checkKey();
    
        
        
        function checkKey() {
            var flag = false;

            for(var i = 0; i < data.rows.length; i++) {
                if('FullUrl' in data.rows[i]) {
                    if (data.rows[i]['FullUrl'] == text){
                        flag = true;
                        res = data.rows[i]['ShortUrl'];
                        console.log(data.rows[i]['ShortUrl']);
                        send();
                    }
                }   
            }

            if (!flag){
                createShortUrl()
            } else {
                db.end();
            }
        }
        
    
        function createShortUrl(){

            const Hashids = require('hashids/cjs')
            const hashids = new Hashids(text);
            res = hashids.encode(1); 
            
            db.query("INSERT INTO shorturl VALUES ($1, $2)",[text, res], function(err, result){

                console.log(err);
                db.end();
                send();
                
            });
            
        }
    
    })
    
    function send() {
        response1.render('shortURL', {
            data: res
        });
        console.log("res = "+ res);
    }
});

app.get('/:token', function(req,res){

    var tokens = req.params.token;
    var URLDone;
    ////////////////////////////////////////////////////
    const {Client} = require('pg');
    
        const db = new Client({
            user: 'postgres',
            host: 'localhost',
            database: 'URL',
            password: '123',
            port: 5432  
        });
        
        db.connect();
        
        db.query('SELECT * FROM shorturl', (err, data) => {
            if (err) 
                throw new Error(err);
                        
            checkKey1();
            
            function checkKey1() {
                
                var flag = false;
                for(var i = 0; i < data.rows.length; i++) {
                    
                  if('ShortUrl' in data.rows[i]) {
                    
                    if (data.rows[i]['ShortUrl'] == tokens){
                        
                        flag = true;
                        console.log("Полная ссылка - " + data.rows[i]['FullUrl']);
                        URLDone = data.rows[i]['FullUrl'];
                        send(URLDone);
                        db.end();
                    }
                  }
                }
            }      
            });
            function send(url) {
                res.redirect(301, url);
                console.log("res = "+ url);
            }
});
        
app.listen(3000);