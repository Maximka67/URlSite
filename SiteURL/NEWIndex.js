const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false});
const Hashids = require('hashids/cjs')
const {Client} = require('pg');

const db = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'URL',
    password: '123',
    port: 5432  
});

db.connect();

app.set('view engine','ejs');

app.use(express.static(__dirname + '/css'));

app.get('/', function(req,res){

    res.render('index');
});

app.get('/shortURL', function(req,res){

    res.render('index');
});

app.post('/shortURL', urlencodedParser, async function(req, response1){
    var res = '';
    var text = req.body.fURL;
    var data = await db.query('SELECT * FROM shorturl');
    var flag = false;
                
    for(var i = 0; i < data.rows.length; i++) {
        if('FullUrl' in data.rows[i]) {
            if (data.rows[i]['FullUrl'] == text){
                flag = true;
                res = data.rows[i]['ShortUrl'];
                console.log(data.rows[i]['ShortUrl']);
                await send();   
            }
        }   
    }

    if (!flag){            
        const hashids = new Hashids(text,5);
        res = hashids.encode(1);     
        await db.query("INSERT INTO shorturl VALUES ($1, $2)",[text, res]);
        await send();
    }
    
    async function send(){
        response1.render('shortURL', {
        data: res
    });
        console.log("token = "+ res);
    } 
    });

app.get('/:token', async function(req,res){
    var tokens = req.params.token;
    var URLDone;
        
    var data = await db.query('SELECT * FROM shorturl'); 

    var flag = false;
    for(var i = 0; i < data.rows.length; i++) {
        if('ShortUrl' in data.rows[i]) {
            if (data.rows[i]['ShortUrl'] == tokens){
                
                flag = true;
                console.log("Полная ссылка - " + data.rows[i]['FullUrl']);
                URLDone = data.rows[i]['FullUrl'];
                res.redirect(301, URLDone);
                console.log("res = "+ URLDone);
            }
        }
    };
});
        
app.listen(3000);
console.log('Запуск выполнен, порт 3000');