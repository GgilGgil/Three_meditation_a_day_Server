var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded( { extended: false }));

app.post('/', function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send('title: Hello');
});

app.post('/insert', function(req, res) {

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
})
