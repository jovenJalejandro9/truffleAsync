var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/test";

var request = require('request');
var cheerio = require('cheerio');
var meetUpsDetalisCollection = "detailsMeetUps";


function asyncLoop(iterations, func, callback) {
  var index = 0;
  var done = false;
  var loop = {
    next: function() {
      if (done) {
          return;
      }

      if (index < iterations) {
          index++;
          func(loop);

      } else {
          done = true;
          callback();
      }
    },

    iteration: function(item) {
      return index - 1;
    },

    break: function() {
      done = true;
      callback();
    }
  };
  loop.next();
  return loop;
}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

var everyId = [];
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  db.collection(meetUpsDetalisCollection).find({},{"memberIds":1}).toArray(function(err, result) {
    if (err) throw err;


    console.log("----------------------------")
    var meetUpsPending = result.length
    result.forEach(function(meetUp){
    	everyId = everyId.concat(meetUp.memberIds)
    	if(--meetUpsPending === 0){		
    		var unique = everyId.filter(onlyUnique)
    		console.log(unique)
				db.close();

    	}
    })

  });
});

