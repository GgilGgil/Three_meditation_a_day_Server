var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();
app.set('view engine', 'jade');
app.set('views', './views');
app.use(bodyParser.urlencoded( { extended: false }));

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
},{
    versionKey: false
});

var todayBibleVerses = mongoose.model('todaybibleverses', todayBibleVersesSchema);

var meditationSchema = mongoose.Schema({
  userid: String,
  year: Number,
  month: Number,
  day : Number,
  morning: {type:String, default:''},
  afternoon: {type:String, default:''},
  evening: {type:String, default:''}
},{
    versionKey: false
});

var meditation = mongoose.model('meditation', meditationSchema)

app.post('/', function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send('title: Hello 삼시묵상');
});

app.get('/saveTodayBibleVerses', function(req, res) {
  res.render('saveTodayBibleVerses');
});

app.post('/saveBibleVerses_receiver', function(req, res) {
  var _year = req.body.year
  var _month = req.body.month
  var _day = req.body.day
  var _bibleverses = req.body.bibleverses

  todayBibleVerses.findOneAndUpdate({'year':_year, 'month':_month, 'day':_day}, {$set:{'bibleverses':_bibleverses}}, function(err, doc){
    if(err){
        return res.status(500).json({'error': err});
    }

    if (doc == null) {
      var bibleversesSave = new todayBibleVerses();
      bibleversesSave.year = _year;
      bibleversesSave.month = _month;
      bibleversesSave.day = _day;
      bibleversesSave.bibleverses = _bibleverses;

      bibleversesSave.save(function(error) {
          if(error){
              res.json({result: 0});
              return;
          }
      });
    }

    res.json({result: 1});
  });
});

//오늘 묵상 말씀을 db에서 가져와서 보냄
app.get('/searchTodayBibleVerses', function(req, res) {
  var _year = req.query.year;
  var _month = req.query.month;
  var _day = req.query.day;

  todayBibleVerses.findOne({'year':_year, 'month':_month, 'day':_day}, function(err, book){
    if(err) {
      return res.status(500).json({'error': err});
    }
    if(!book) {
      return res.status(404).json({'error': 'data not found'})
    }
    res.json(book);
  });
});

//오늘 저장한 묵상 내용을 db에서 가져와서 보냄
app.get('/searchTodayMeditation', function(req, res) {
  var _userId = req.query.userid
  var _year = req.query.year;
  var _month = req.query.month;
  var _day = req.query.day;

  meditation.findOne({'userid':_userId, 'year':_year, 'month':_month, 'day':_day}, function(err, book){
    if(err) {
      return res.status(500).json({'error': err});
    }
    if(!book) {
      return res.status(404).json({'error': 'data not found'})
    }
    res.json(book);
  });
});

//아침묵상 저장
app.get('/saveMorningMeditation', function(req, res) {
  var _userId = req.query.userid;
  var _year = req.query.year;
  var _month = req.query.month;
  var _day = req.query.day;
  var _morning = req.query.morning;

  meditation.findOneAndUpdate({'userid':_userId, 'year':_year, 'month':_month, 'day':_day}, {$set:{'morning':_morning}}, function(err, doc){
    if(err){
        return res.status(500).json({'error': err});
    }

    if (doc == null) {
      var meditationSave = new meditation();
      meditationSave.userid = _userId;
      meditationSave.year = _year;
      meditationSave.month = _month;
      meditationSave.day = _day;
      meditationSave.morning = _morning;
      meditationSave.afternoon = '';
      meditationSave.evening = '';

      meditationSave.save(function(error) {
          if(error){
              res.json({result: 0});
              return;
          }
      });
    }

    res.json({result: 1});
  });
});

//점심묵상 저장
app.get('/saveAfternoonMeditation', function(req, res) {
  var _userId = req.query.userid;
  var _year = req.query.year;
  var _month = req.query.month;
  var _day = req.query.day;
  var _afternoon = req.query.afternoon;

  meditation.findOneAndUpdate({'userid':_userId, 'year':_year, 'month':_month, 'day':_day}, {$set:{'afternoon':_afternoon}}, function(err, doc){
    if(err){
        return res.status(500).json({'error': err});
    }

    if (doc == null) {
      var meditationSave = new meditation();
      meditationSave.userid = _userId;
      meditationSave.year = _year;
      meditationSave.month = _month;
      meditationSave.day = _day;
      // meditationSave.morning = '';
      meditationSave.afternoon = _afternonn;
      // meditationSave.evening = '';

      meditationSave.save(function(error) {
          if(error){
              res.json({result: 0});
              return;
          }
      });
    }

    res.json({result: 1});
  });
});

//저녁묵상 저장
app.get('/saveEveningMeditation', function(req, res) {
  var _userId = req.query.userid;
  var _year = req.query.year;
  var _month = req.query.month;
  var _day = req.query.day;
  var _evening = req.query.evening;

  meditation.findOneAndUpdate({'userid':_userId, 'year':_year, 'month':_month, 'day':_day}, {$set:{'evening':_evening}}, function(err, doc){
    if(err){
        return res.status(500).json({'error': err});
    }

    if (doc == null) {
      var meditationSave = new meditation();
      meditationSave.userid = _userId;
      meditationSave.year = _year;
      meditationSave.month = _month;
      meditationSave.day = _day;
      // meditationSave.morning = '';
      // meditationSave.afternoon = '';
      meditationSave.evening = _evening;

      meditationSave.save(function(error) {
          if(error){
              res.json({result: 0});
              return;
          }
      });
    }

    res.json({result: 1});
  });
});

app.listen(3000, function() {
  console.log('Connected Three meditation a day Server!')
});
