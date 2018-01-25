var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();
app.use(bodyParser.urlencoded( { extended: false }));
// mongoClient.connect('mongodb://127.0.0.1:27017/Three_meditaton_a_day', function(error, db) {
//   if(error) {
//     console.log(error);
//   } else {
//     console.log('connected:'+db);
//     console.log()
//     db.close();
//   }
// });

mongoose.connect('mongodb://127.0.0.1:27017/Three_meditation_a_day');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

var todayBibleVersesSchema = mongoose.Schema({
  year: Number,
  month: Number,
  day : Number,
  bibleverses:String
});

var todayBibleVerses = mongoose.model('todaybibleverses', todayBibleVersesSchema);

app.post('/', function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send('title: Hello');
});

app.post('/insert', function(req, res) {

});

app.get('/todayBibleVerses', function(req, res) {
  var _year = req.query.year;
  var _month = req.query.month;
  var _day = req.query.day;

  console.log(_year)
  console.log(_month)
  console.log(_day)

  todayBibleVerses.findOne({'year':_year, 'month':_month, 'day':_day}, function(err, book){
    if(err) {
      return res.status(500).json({'error': err});
    }
    if(!book) {
      return res.status(404).json({'error': 'book not found'})
    }
    res.json(book);
  });
});

app.post('/bibleVerses', function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send('잠언 16장\n9. 사람이 마음으로 자기의 길을 계획할지라도 그의 걸음을 인도하시는 이는 여호와시니라');
});

app.post('/morning', function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send('나의 마음대로 되는 것은 없으니 하나님을 믿고 따라가자');
});

app.post('/afternoon', function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send('오늘도 하나님의 뜻을 따라 살기로 했지만 세상에 많이 휘둘리는 나를 보았다. 남은 시간이라도 하나님의 뜻대로 살아보자!')
});

app.post('/evening', function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send('아쉬운 하루이지만 그래도 오후에 많은 사람들을 도와주고 또한 나의 일도 열심히 하여 조금은 하나님의 말씀대로 살았던게 아니었을까?');
});

app.listen(3000, function() {
  console.log('Connected Three meditation a day Server!')
});
