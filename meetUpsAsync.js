var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/test";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



function extracLinksSeed(url,callback){
  var options = {
    headers: {
      'User-Agent': 'node.js'
    }
  };

  request(url, function (error, response, html){

    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      ////////////////////////////////////////////////////////////////////////////////////remove eq()
      const lis =  $("a.groupCard--photo.loading.nametag-photo").get();
      //const lis =  $("a.groupCard--photo.loading.nametag-photo").eq(0).get();


      var listUrls=[];
      lis.forEach(function(div){
        var urlMeetup = $(div).first().prop('href').trim();
        var infoUrl = {}
        infoUrl.url = urlMeetup;
        var arrayUrl = urlMeetup.split("/")
        infoUrl.id = arrayUrl[(arrayUrl.length-2)];
        listUrls.push(urlMeetup);
      })
      ///////////////////////////////////////////Ejemplo facil bucle
      //callback(["https://www.meetup.com/es-ES/Estudiar-y-Laborar-en-EEUU-para-Ing-de-Sistemas-y-Afines/", "https://www.meetup.com/es-ES/Arquitectura-Empresarial/"])
      //callback(["https://www.meetup.com/es/Azure-Day/"])
      callback(listUrls);
      //callback(["https://www.meetup.com/es-ES/MovimientoAgil/"]);
    }else{
      console.log("linsks Seed: "+url)
    }
  })
}



function extractLinksAjax(url,linksSeed,callback){

  request(url, function (error, response, html){

    if (!error && response.statusCode == 200) {
      var myObj = JSON.parse(html);
      var $ = cheerio.load(myObj[0]);
      const lis =  $("a.groupCard--photo.loading.nametag-photo ").get();
      var listUrls = linksSeed;
      /////////////////////////////////////////////Comentar bucle para ejemplo facil
      lis.forEach(function(div){
        var urlMeetup = $(div).first().prop('href').trim();
        var infoUrl = {}
        infoUrl.url = urlMeetup;
        var arrayUrl = urlMeetup.split("/")
        infoUrl.id = arrayUrl[(arrayUrl.length-2)];
        
        listUrls.push(urlMeetup);

      })
      callback(listUrls);
    }else{
      console.log("Links Ajax: "+url)
    }
  })
}

function getLastUrlPage(url,index,options,callback){
  if(url != "no"){
    request(url,options,(error,response,html) => {  
      if(!error && response.statusCode == 200){
        var $ = cheerio.load(html);

        var lastUrl = $('li .nav-next').prop('href')

        if(lastUrl == undefined){
          infoMeetUps[index]["lastUrl"] = url;
          callback(url)
        }else{
          infoMeetUps[index]["lastUrl"] = lastUrl
          callback(lastUrl)
        }
      }else
      console.log("lasUrlPage: "+url)
    })    
  }
  else {
    infoMeetUps[index]["lastUrl"] = "no"
    callback("no")
  }
}

function getLastNumberPage(url,index,options,callback){
  if(url != "no"){   
    request(url,options,(error,response,html) => {  
      if(!error && response.statusCode == 200){
        var $ = cheerio.load(html);
        var lastUrlPage = $("li.nav-pageitem").last().text()
        infoMeetUps[index]["numberLastUrl"] = lastUrlPage
        callback(lastUrlPage)
      }else
      console.log("Last Number page: "+url)
    })
  }
  else{
    infoMeetUps[index]["numberLastUrl"] = "no"
    callback("no")
  }
}
function extractIdMembers(url,index,listIds,options,callback){
  request(url,options,(error,response,html) => {  
    if(!error && response.statusCode ==200){
      var $ = cheerio.load(html);

      var lis = $("a.memName").get()

      lis.forEach(function(elem){
        listIds.push(getIdFromUrl($(elem).attr('href')))
        //console.log("id mUp "+index+": "+getIdFromUrl($(elem).attr('href')))
      })

     callback(listIds)

    }else
    console.log("extractIdMembers: "+url)
  })
}
function getIdFromUrl(url){
  var arrayUrl = url.split("/")
  var id = arrayUrl[(arrayUrl.length-2)]
  return  id;
}

function extractMeetUpImportantinfo(url, options,callback){
  request(url,options,(error,response,html) => {  
    if(!error && response.statusCode == 200){
      var $ = cheerio.load(html);
      urlMembers = "no"
      //topNab
      var topNav = $("ul.chapter-menu.inlineblockList li a").get() 
       topNav.forEach(function(item){
        if($(item).text().trim() == "Miembros"){
          urlMembers = $(item).prop("href");
          console.log("dentro de url Members")
        }

       }) 

       console.log("URL MEMBERS: "+urlMembers)

      //meetUp id
    
      var meetUpInfo = {"url":url,"urlMembers":urlMembers,"id":getIdFromUrl(url)}
      infoMeetUps.push(meetUpInfo)
      callback(meetUpInfo)
    }else{
      console.log("extractImportantInfo: "+url)
    }
  });
}

function extractDetails(meetUpInfo,index,options,callback){
  request(meetUpInfo.url,options,(error,response,html) => { 
    console.log("extract details!!")
    console.log(meetUpInfo)

    if(!error && response.statusCode == 200){
      var $ = cheerio.load(html);  

      //locality
      infoMeetUps[index]["locality"] = "no";
      infoMeetUps[index]["locality"] = $("span.locality").text();
      //region
      infoMeetUps[index]["region"] = "no";
      infoMeetUps[index]["region"] = $("span.region").text();
      //localityUrl
      infoMeetUps[index]["localityUrl"] = "no";
      infoMeetUps[index]["localityUrl"] = $("h3.text--reset.flush--bottom a").attr("href");
      //fundationDate
      infoMeetUps[index]["fundationDate"] = "no";
      infoMeetUps[index]["fundationDate"] = $("div.small.margin-bottom").first().text().trim().replace("\n"," ");
      //Left Column
      var topLeft = $("a.block.hoverLink").get();

      //We fill in the empty fields
      infoMeetUps[index]["numberOfMembers"] = "no";
      infoMeetUps[index]["urlMembers"] = "no";
      infoMeetUps[index]["numberOfOpinions"] = "no";
      infoMeetUps[index]["urlOpinions"] = "no";    
      infoMeetUps[index]["numberNextMeetUps"] = "no";
      infoMeetUps[index]["urlNextMeetUps"] = "no";    
      infoMeetUps[index]["numberOfPreviousMeetUs"] = "no";
      infoMeetUps[index]["urlPreviousMeetUps"] = "no";
      infoMeetUps[index]["urlCalendar"] = "no";
      

      for(var i = 0 ; i < topLeft.length ; i++){
        if(i == 0){
          infoMeetUps[index]["numberOfMembers"] = $(topLeft[i]).find("span.lastUnit.align-right").text();
          infoMeetUps[index]["urlMembers"] = $(topLeft[i]).prop("href");
        }else{
          if($(topLeft[i]).find("span.unit.size5of7").text().trim() == ("Opiniones sobre el grupo")){
            infoMeetUps[index]["numberOfOpinions"] = $(topLeft[i]).find("span.lastUnit.align-right").text();
            infoMeetUps[index]["urlOpinions"] = $(topLeft[i]).prop("href");
          }
          if($(topLeft[i]).find("span.unit.size5of7").text().trim() == ("Meetups anteriores")){
            infoMeetUps[index]["numberOfPreviousMeetUs"] = $(topLeft[i]).find("span.lastUnit.align-right").text();
            infoMeetUps[index]["urlPreviousMeetUps"] = $(topLeft[i]).prop("href");
          }
          if($(topLeft[i]).find("span.unit.size5of7").text().trim() == ("Meetups previstos")){
            infoMeetUps[index]["numberNextMeetUps"] = $(topLeft[i]).find("span.lastUnit.align-right").text();
            infoMeetUps[index]["urlNextMeetUps"] = $(topLeft[i]).prop("href");
          }
          if($(topLeft[i]).find("span.unit.size5of7").text().trim() == ("Nuestro calendario")){
            infoMeetUps[index]["urlCalendar"] = $(topLeft[i]).prop("href");
          }
        }
      }

      var organizers = [];
      //organizers
      var urlOrganizers = $("span#meta-leaders a").get();
      urlOrganizers.forEach(function(organizer){
        organizers.push(getIdFromUrl($(organizer).prop("href")));
      });
      infoMeetUps[index]["organizers"] = organizers;
      if(organizers.length == 0){
        infoMeetUps[index]["organizers"] = "no";
      }

      //themes
      var themes = [];
      var urlThemes = $("div#topicList15 a").get();
      urlThemes.forEach(function(theme){
        themes.push($(theme).prop("href"));
      });
      infoMeetUps[index]["themes"] = themes;
      if(themes.length == 0){
        infoMeetUps[index]["themes"] = "no";
      }

      //topNab
      var topNav = $("ul.chapter-menu.inlineblockList li a").get()        

      
      //We fill in the empty fields        
      infoMeetUps[index]["sponsors"] = "no";
      infoMeetUps[index]["photos"] = "no";      
      infoMeetUps[index]["pages"] = "no";      
      infoMeetUps[index]["conversations"] = "no";
      
      topNav.forEach(function(item){

        if($(item).text().trim() == "Patrocinadores"){
          infoMeetUps[index]["sponsors"] = $(item).prop("href");
        }
        if($(item).text().trim() == "Fotos"){
          infoMeetUps[index]["photos"] = $(item).prop("href");
        }
        if($(item).text().trim() == "Páginas"){
          infoMeetUps[index]["pages"] = $(item).prop("href");
        }
        if($(item).text().trim() == "Conversaciones"){
          infoMeetUps[index]["conversations"] = $(item).prop("href");
        }
      })

      callback()
    }else{
      console.log("details: "+url);      
    }
  });
}

/*MAIN PROGRAM*/

listItmes = {santiago:{
  field: 'tech',
  city: 'Santiago',
  meetup: 'Javascript-Chile'
}};

var listSrcDst = [];
var urlAjax = "https://www.meetup.com/es/find/tech/?pageToken=default%7C100&allMeetups=false&keywords=&radius=31&userFreeform=Santiago&mcName=Santiago&sort=default&__fragment=simple_search&op=";  
var urlSeed = "https://www.meetup.com/es-ES/find/tech/?allMeetups=false&radius=50&userFreeform=sant&mcId=c1005582&change=yes&sort=default"; 
var iniUrlSize = urlSeed.length;
var options = {
  headers: {
    'User-Agent': 'node.js'
  }
}


function asyncLoop(iterations, func, callback) {
    var index = 0;
    var done = false;
    var everyItem = []
    var loop = {
      next: function() {

        if (done) {
            return;
        }

        if (index < iterations) {
          index++;
          //everyItem.push();
          func(loop);

        } else {
          done = true;
          callback();
        }
      },

      iteration: function() {
        //console.log(everyItem)
        return index - 1
      },

      break: function() {
        done = true;
        callback();
      }
    };
    loop.next();
    return loop;
}


var request = require('request');
var cheerio = require('cheerio');
var meetUpsDetalisCollection = "detailsMeetUps";
var infoMeetUps = []

MongoClient.connect("mongodb://127.0.0.1:27017/test", function(err, db) {
  //We clean this collection
  db.collection(meetUpsDetalisCollection).remove({})
  //extraction of lastUrl
  extracLinksSeed(urlSeed, function(lisLinksSeed){
    extractLinksAjax(urlAjax,lisLinksSeed,function(everyLink){
      console.log("--------MeetUpLinks--------")
      console.log(everyLink)
      console.log("----------------------------------------------\n")

      var pendingMeetUps = everyLink.length, varPendingMeetUps = everyLink.length
      //var pendingMeetUps = 10, varPendingMeetUps = 10

      asyncLoop(pendingMeetUps, function(loop) {
        var urlMeetUp = everyLink[loop.iteration()]

        extractMeetUpImportantinfo(urlMeetUp,options,function(meetUpInfo){
          console.log("----------------MEETUP "+(loop.iteration()+1)+" for "+pendingMeetUps+"----------------"+meetUpInfo.urlMembers)
          extractDetails(meetUpInfo,loop.iteration(),options, function(){
            getLastUrlPage(meetUpInfo.urlMembers,loop.iteration(),options,function(lastUrl){
              getLastNumberPage(lastUrl,loop.iteration(),options,function(number){
                var listTabs = []
                for(var i = 0; i < number ; i++){
                  listTabs.push("https://www.meetup.com/es-ES/"+meetUpInfo.id+"/members/?offset="+i*20+"&sort=last_visited&desc=1");
                }  
                infoMeetUps[loop.iteration()]["totalTabs"] = listTabs
                var numTabs = listTabs.length;
                //second look
                console.log("number of tabs: "+ numTabs)

                var listIds = []
                asyncLoop(numTabs, function(loop2) {
                  console.log("url tabs: "+infoMeetUps[loop.iteration()].totalTabs[loop2.iteration()])
                  infoMeetUps[loop.iteration()]["memberIds"] = []
                  extractIdMembers(infoMeetUps[loop.iteration()].totalTabs[loop2.iteration()],loop.iteration(),listIds,options,function(ids) {
                    //console.log("ids: "+ids)
                    // Okay, for cycle could continue
                    loop2.next();
                  })},
                  function(){
                    console.log('cycle ended')
                    infoMeetUps[loop.iteration()]["memberIds"] = listIds 
                    db.collection(meetUpsDetalisCollection).insert(infoMeetUps[loop.iteration()],function(err, result) {
                      if (err) throw err;
                    });

                    console.log("-------------------------------------------------------\n")
                    loop.next();

                  }
                )
              })
            })
          })
        })
      },
        function(){
          console.log("--------------------------------------------------------------------------------------")
          console.log('cycle ended')
          console.log(infoMeetUps)
          db.close()
        }
      );

    })

  })
});







