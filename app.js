var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bkfd2Password = require("pbkdf2-password");

var hasher = bkfd2Password();
var app = express();
var router = express.Router();

app.set('view engine', 'jade');
app.set('views', './views');

app.use(bodyParser.urlencoded( { extended: false }));
app.use(bodyParser.json());

//mongodb connect
mongoose.connect('mongodb://127.0.0.1:27017/Three_meditation_a_day');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

//mongoose schema 정의
var todayBibleVersesSchema = mongoose.Schema({
  year: Number,
  month: Number,
  day : Number,
  bibleverses:String
},{
    versionKey: false
}); //오늘의 말씀 schema

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
}); //묵상 schema

var checkerSchema = mongoose.Schema({
  password: String,
  salt: String,
  type: String
},{
    versionKey: false
}); //checker schema

var userSchema = mongoose.Schema({
  userid: String,
  password: String,
  salt: String,
},{
    versionKey: false
}); //register schema

var todayBibleVerses = mongoose.model('todaybibleverses', todayBibleVersesSchema);
var meditation = mongoose.model('meditation', meditationSchema);
var checker = mongoose.model('checker', checkerSchema);
var userInfo = mongoose.model('user', userSchema);

var search = express.Router();
var save = express.Router();
var user = express.Router();

app.use('/search', search);
app.use('/save', save);
app.use('/user', user);

var usercheck = function(userid) {

};

app.post('/', function(req, res) {
  res.set('Content-Type', 'text/plain');
  res.send('title: Hello 삼시묵상');
});

//오늘 묵상 말씀을 db에서 가져와서 보냄
search.get('/todaybibleverses', function(req, res) {
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
search.get('/todaymeditation', function(req, res) {
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

search.get('/currentMonthMeditation', function(req, res) {
  var _userId = req.query.userid
  var _year = req.query.year;
  var _month = req.query.month;

  meditation.find({'userid':_userId, 'year':_year, 'month':_month}, {}, function(err, book){
    if(err) {
      return res.status(500).json({'error': err});
    }
    if(!book) {
      return res.status(404).json({'error': 'data not found'})
    }
    res.json(book);
  });
});

//오늘의 묵상 내용 저장 화면
save.get('/todaybibleverses', function(req, res) {
  res.render('saveTodayBibleVerses');

});

//오늘의 묵상 저장 receiver
save.post('/bibleberses_receiver', function(req, res) {
  var _year = req.body.year
  var _month = req.body.month
  var _day = req.body.day
  var _bibleverses = req.body.bibleverses
  var _pass = req.body.pass

  checker.findOne({'type':'bibleversesSave'}, function(err, data){
    if(err) {
      return res.status(500).json({'error': err});
    }
    if(!data) {
      return res.status(404).json({'error': 'key not found'});
    }

    return hasher({password:_pass, salt:data.salt}, function(err, pass, salt, hash) {
      if(hash === data.password) {
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
      } else {
        res.json({result: 0});
      }
    });
  });
});

//아침묵상 저장
save.post('/morningmeditation', function(req, res) {
  var _userId = req.body.userid;
  var _pass = req.body.pass;
  var _year = req.body.year;
  var _month = req.body.month;
  var _day = req.body.day;
  var _morning = req.body.morning;

  userInfo.findOne({'userid':_userId}, function(err, data){
    if(err) {
      return res.status(500).json({'error': err});
    }
    if(!data) {
      return res.status(404).json({'error': 'key not found'});
    }

    return hasher({password:_pass, salt:data.salt}, function(err, pass, salt, hash) {

      if(hash === data.password) {
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

            meditationSave.save(function(error) {
                if(error){
                    res.json({result: 0});
                    return;
                }
            });
          }

          res.json({result: 1});
        });
      } else {
        res.json({result: 0});
      }
    });
  });
});

//점심묵상 저장
save.post('/afternoonmeditation', function(req, res) {
  var _userId = req.body.userid;
  var _pass = req.body.pass;
  var _year = req.body.year;
  var _month = req.body.month;
  var _day = req.body.day;
  var _afternoon = req.body.afternoon;

  userInfo.findOne({'userid':_userId}, function(err, data){
    if(err) {
      return res.status(500).json({'error': err});
    }
    if(!data) {
      return res.status(404).json({'error': 'key not found'});
    }

    return hasher({password:_pass, salt:data.salt}, function(err, pass, salt, hash) {
      if(hash === data.password) {
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
            meditationSave.afternoon = _afternoon;

            meditationSave.save(function(error) {
                if(error){
                    res.json({result: 0});
                    return;
                }
            });
          }

          res.json({result: 1});
        });
      } else {
        res.json({result: 0});
      }
    });
  });
});

//저녁묵상 저장
save.post('/eveningmeditation', function(req, res) {
  var _userId = req.body.userid;
  var _pass = req.body.pass;
  var _year = req.body.year;
  var _month = req.body.month;
  var _day = req.body.day;
  var _evening = req.body.evening;

  userInfo.findOne({'userid':_userId}, function(err, data){
    if(err) {
      return res.status(500).json({'error': err});
    }
    if(!data) {
      return res.status(404).json({'error': 'key not found'});
    }

    return hasher({password:_pass, salt:data.salt}, function(err, pass, salt, hash) {
      if(hash === data.password) {
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
      } else {
        res.json({result: 0});
      }
    });
  });
});

user.post('/register', function(req, res) {
  var _userId = req.body.userid;
  var _accessToken = req.body.accesstoken;

  userInfo.findOne({'userid':_userId}, function(err, data){
    if(err) {
      return res.status(500).json({'error': err});
    }

    if(!data) {

      var _pass = _userId+'token'+_accessToken;

      return hasher({password:_pass}, function(err, pass, salt, hash) {
        var userSave = new userInfo();
        userSave.userid = _userId;
        userSave.password = hash;
        userSave.salt = salt;

        userSave.save(function(error) {
            if(error){
                res.json({result: 0});
            } else {
              res.json({result: 1});
            }
        });
      });
    }
  });
});

app.listen(80, function() {
  console.log('Connected Three meditation a day Server!')
});
