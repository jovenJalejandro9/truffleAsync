var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/test";

var request = require('request');
var cheerio = require('cheerio');


function extractDetails(url,id,index,options,callback){
  console.log(currentDate()+" INSIDE OF EXTRACDETAILS ("+url+")")

  request(url,options,(error,response,html) => {  
    console.log(currentDate()+"SIZE INFOMEMBERS: "+ infoUsers.length  )
    console.log(currentDate()+"ERROR: ")
    console.log(error)
    //console.log("RESPONSE: ")
    //console.log(response.statusCode)
    if(!error && response.statusCode == 200){
      console.log(currentDate()+" PAGE OBTAINED SUCCESSFULLY ("+url+")")
      var $ = cheerio.load(html);

      var userDetails = {}
      
      //user URL
      infoUsers.push({"url":url})
      
      //boolean extist
      infoUsers[index]["exist"] = "yes"
      //User ID
      infoUsers[index]["idMember"] = id 

      //user name
      infoUsers[index]["name"] = $("span.memName.fn").text().trim()

      //General Description
      infoUsers[index]["description"] = $("div.D_memberProfileContentItem p").eq(2).text().trim()
      if(infoUsers[index]["description"] == ""){
        infoUsers[index]["description"] = "no"
      }

      //image
      infoUsers[index]["image"] = $("img.D_memberProfilePhoto.photo.big-preview-photo").attr('src')
      if(infoUsers[index]["image"] == ""){
        infoUsers[index]["image"] = "no"
      }

      //locality
      infoUsers[index]["locality"] = $("span.locality").first().text().trim()
      if(infoUsers[index]["locality"] == ""){
        infoUsers[index]["locality"] = "no"
      }
      //localityLink
      infoUsers[index]["localityLink"] = $("div.D_memberProfileContentItem p a").attr('href')
      if(infoUsers[index]["localityLink"] == ""){
        infoUsers[index]["localityLink"] = "no"
      }

      //Region
      infoUsers[index]["region"] = $("span.region").first().text().trim()
      if(infoUsers[index]["region"] == ""){
        infoUsers[index]["region"] = "no"
      }    
      //Oigin city 
      var originCity = $('span.D_less.small').text();
      infoUsers[index]["originCity"] = originCity.replace('Ciudad de origen:','').trim()
      if(infoUsers[index]["originCity"] == ""){
        infoUsers[index]["originCity"] = "no"
      }          

      //Interests
      var everyinterest = $("a.topic-widget").get()
      var listInterest = []
      everyinterest.forEach(function(interest){
        listInterest.push($(interest).prop('href'))
      })
      infoUsers[index]["Interests"] = listInterest 
      if(infoUsers[index]["Interests"] == ""){
        infoUsers[index]["Interests"] = "no"
      }

      //Social MEDIA
      infoUsers[index]["facebook"] = "no"
      infoUsers[index]["twitter"] = "no"
      infoUsers[index]["linkedin"] = "no"
      var everySocialMedia = $("ul.inlineList.flush--bottom li a").get()
      everySocialMedia.forEach(function(item){
        if($(item).attr("title").trim().includes("Facebook")){
          infoUsers[index]["facebook"] = $(item).attr("href").trim()
        }
        if($(item).attr("title").trim().includes("Twitter")){
          infoUsers[index]["twitter"] = $(item).attr("href").trim()  
        }
        if($(item).attr("title").trim().includes("Linkedin")){
          infoUsers[index]["linkedin"] = $(item).attr("href").trim()  
        }

      })


      console.log(currentDate()+" DETAILS SAVED SUCCESSFULLY ("+url+")")

      callback(infoUsers[index])
    }else{
      infoUsers.push({url:url,idMember:id,exist:"no"})      
      callback(infoUsers[index])
      console.log("Error found")


    }

  });
}
function currentDate(){
  var currentdate = new Date(); 
  var date = "[" + currentdate.getDate() + "/"
              + (currentdate.getMonth()+1)  + "/" 
              + currentdate.getFullYear() + " @ "  
              + currentdate.getHours() + ":"  
              + currentdate.getMinutes() + ":" 
              + currentdate.getSeconds() + "]";
  return date;
}
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
var options = {
    headers: {
    'User-Agent': 'node.js'
  }
}

var infoUsers = []
var everyId = [];
var meetUpsDetalisCollection = "detailsMeetUps";
var meetUpsMembersCollection = "usersMeetUps";
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  db.collection(meetUpsDetalisCollection).find({},{"memberIds":1}).toArray(function(err, result) {
    db.collection(meetUpsMembersCollection).remove({})
    if (err) throw err;
    console.log("----------------------------")
    var meetUpsPending = result.length
    var unique = []
    result.forEach(function(meetUp){
      everyId = everyId.concat(meetUp.memberIds)
      if(--meetUpsPending === 0){   
        var pendingEveryId = everyId.length
        everyId.forEach(function(id){
          if(unique.indexOf(id) < 0){
            unique.push(id)
          }
          if(--pendingEveryId === 0){
            //unique = [ '198031339','199140309','74459902',"185465666"]
            
            console.log(unique)
            asyncLoop(unique.length, function(loop) {
              //infoUsers.push({"url":"https://www.meetup.com/es-ES/members/"+unique[loop.iteration()]})
              //infoUsers[loop.iteration()]["id"] = unique[loop.iteration()] 
              console.log("\n"+currentDate()+" USER "+(loop.iteration()+1)+" OF "+unique.length +"("+unique[loop.iteration()]+")")
              if(loop.iteration() > 0){
                console.log(currentDate()+" PREVIUS USER "+(loop.iteration())+" OF "+unique.length +"("+unique[loop.iteration()-1]+")")
              }

              if(loop.iteration() < unique.length-1){
                console.log(currentDate()+" NEXT USER "+(loop.iteration()+2)+" OF "+unique.length +"("+unique[loop.iteration()+1]+")")
              }
              console.log(currentDate()+" loopIteration: "+loop.iteration())
              extractDetails("https://www.meetup.com/es-ES/members/"+unique[loop.iteration()],unique[loop.iteration()] ,loop.iteration(),options, function(user) {

                console.log(user)
                console.log("----------------------------------")
                
                db.collection(meetUpsMembersCollection).insert(user,function(err, result) {
                  if (err) throw err;
                  loop.next();
                }) 
            
              })},
              function(){
                console.log('The end')
                //console.log(infoUsers)
                db.close();
              }
            )
          }
        })
            //var unique = everyId.filter(onlyUnique)
            //var unique = [ '198031339','199140309','74459902']

      }
    })

  });
});

