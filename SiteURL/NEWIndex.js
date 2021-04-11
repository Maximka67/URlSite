var express = require('express');
var bodyParser = require('body-parser');
var app = express();


var urlencodedParser = bodyParser.urlencoded({ extended: false});


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

app.post('/shortURL', urlencodedParser, function(req, response1){

    var res = '';
    var text = req.body.fURL;
    
    db.query('SELECT * FROM shorturl', async (err, data) => {

        var flag = false;



        if (err) 
            throw new Error(err);
                    
        

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
            // console.log('Вызов функции');
            // console.log('Начало выполнения');
            
            const hashids = new Hashids(text,5);
            res = hashids.encode(1); 
    
            await db.query("INSERT INTO shorturl VALUES ($1, $2)",[text, res]);

            await send();
           
        }
        

        async function send(){
         
            response1.render('shortURL', {
            data: res
        });
         console.log("res = "+ res);
        
        } 
    
    })




    
});

app.get('/:token', function(req,res){

    var tokens = req.params.token;
    var URLDone;
        
    db.query('SELECT * FROM shorturl', (err, data) => {
        if (err) 
            throw new Error(err);
            
        var flag = false;
        for(var i = 0; i < data.rows.length; i++) {
            
            if('ShortUrl' in data.rows[i]) {
            
                if (data.rows[i]['ShortUrl'] == tokens){
                    
                    flag = true;
                    console.log("Полная ссылка - " + data.rows[i]['FullUrl']);
                    URLDone = data.rows[i]['FullUrl'];
                    send(URLDone);
                    
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