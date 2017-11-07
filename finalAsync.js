
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/test";
var fs = require('fs');
var json2csv = require('json2csv');
var newLine= "\r\n";


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

function storeMeetUp(meetUp,index,callback){
  var infoMeetUps = {}

  //MeetUp info
  infoMeetUps["idMeetUp"]=meetUp["id"]
  infoMeetUps["urlMeetUp"]=meetUp["url"]
  infoMeetUps["urlmembersMeetUp"]=meetUp["urlMembers"]
  infoMeetUps["localityMeetUp"]=meetUp["locality"]
  infoMeetUps["regionMeetUp"]=meetUp["region"]  
  infoMeetUps["localityUrlMeetUp"]=meetUp["localityUrl"]  
  infoMeetUps["fundationDateMeetUp"]=meetUp["fundationDate"]  
  infoMeetUps["numberOfMembersMeetUp"]=meetUp["numberOfMembers"]  
  infoMeetUps["numberOfOpinionsMeetUp"]=meetUp["numberOfOpinions"]  
  infoMeetUps["urlOpinionsMeetUp"]=meetUp["urlOpinions"]  
  infoMeetUps["numberNextMeetUps"]=meetUp["numberNextMeetUps"]  
  infoMeetUps["urlNextMeetUps"]=meetUp["numberNextMeetUps"]  
  infoMeetUps["numberOfPreviousMeetUps"]=meetUp["numberOfPreviousMeetUps"]  
  infoMeetUps["urlPreviousMeetUps"]=meetUp["urlPreviousMeetUps"]
  infoMeetUps["urlCalendarMeetUp"]=meetUp["urlCalendar"]
  infoMeetUps["organizersMeetUp"]=meetUp["organizers"]
  infoMeetUps["sponsorsMeetUp"]=meetUp["sponsors"]
  infoMeetUps["photosMeetUp"]=meetUp["photos"]
  infoMeetUps["pagesMeetUp"]=meetUp["pages"]
  infoMeetUps["conversationsMeetUp"]=meetUp["conversations"]



  //user Info
  infoMeetUps["idMember"] = meetUp["member"][0]["idMember"]
  infoMeetUps["nameMember"] = meetUp["member"][0]["name"]
  infoMeetUps["descriptionMember"] = meetUp["member"][0]["description"]
  infoMeetUps["imageMember"] = meetUp["member"][0]["image"]
  infoMeetUps["localityMember"] = meetUp["member"][0]["locality"]
  infoMeetUps["localityLinkMember"] = meetUp["member"][0]["localityLink"]
  infoMeetUps["regionMember"] = meetUp["member"][0]["region"]
  infoMeetUps["originCityMember"] = meetUp["member"][0]["originCity"]
  infoMeetUps["facebookMember"] = meetUp["member"][0]["facebook"]
  infoMeetUps["twitterMember"] = meetUp["member"][0]["twitter"]
  infoMeetUps["linkedinMember"] = meetUp["member"][0]["linkedin"]



  toCsv["data"][0] = infoMeetUps
  //write the actual data and end with newline
  var csv = json2csv(toCsv) + newLine;

  fs.appendFile('file.csv', csv, function (err) {
    if (err) throw err;
    console.log('The "data to append" was appended to file!');
    console.log(infoMeetUps)
    callback()
  });


}



var fields = ["idMember","nameMember",'idMeetUp','urlMeetUp',,"imageMember","facebookMember","twitterMember","linkedinMember","urlmembersMeetUp",
"localityMeetUp","regionMeetUp","localityUrlMeetUp","fundationDateMeetUp","numberOfMembersMeetUp","numberOfOpinionsMeetUp","urlOpinionsMeetUp",
"numberNextMeetUps","urlNextMeetUps","numberOfPreviousMeetUps","urlPreviousMeetUps","urlCalendarMeetUp","organizersMeetUp","sponsorsMeetUp","photosMeetUp",
"pagesMeetUp","conversationsMeetUp","descriptionMember","localityMember","localityLinkMember","regionMember","originCityMember"];
var newLine= "\r\n";

var toCsv = {
    data: [{}],
    fields: fields,
    hasCSVColumnTitle: false
};


MongoClient.connect(url, function(err, db) {
  console.log("al principioooo")
  db.collection("detailsMeetUps").findOne({},function(err,item){
    console.log("---------------")
    console.log(item)
    console.log("---------------")
  });
  db.collection("detailsMeetUps").aggregate([
    {
      $unwind: "$memberIds"
    },
    {
      $lookup:
        {
          from: "usersMeetUps",
          localField: "memberIds",
          foreignField: "idMember",
          as: "member"
        }
   },
   {
      $match: { "member": { $ne: [] } }
   
  }],function(err,result){
    //write the headers and newline
    console.log('New file, just writing headers');
    fields= (fields + newLine);

    fs.writeFile('file.csv', fields, function (err, stat) {
        if (err) throw err;
        console.log('file saved');
    });
    //console.log("result!!")
    //console.log(result)
    asyncLoop(result.length, function(loop) {
        storeMeetUp(result[loop.iteration()],loop.iteration(),function() {
            loop.next();
        })},
        function(){
          console.log('cycle ended')
          db.close()
        }
    );
  }) 
});