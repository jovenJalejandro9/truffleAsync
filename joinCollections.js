
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017/test";



MongoClient.connect(url, function(err, db) {

  //db.collection("ordersDB").remove({})
  db.collection("inventoryDB").remove({})
  var orders = { "item" : "MON1003", "price" : 350, "quantity" : 2, "specs" :
  [ "27 inch", "Retina display", "MON1031" ], "type" : "Monitor" };

  var inventory = [{ "sku" : "MON1003", "type" : "Monitor", "instock" : 120,
  "size" : "27 inch", "resolution" : "1920x1080" },
  {"sku" : "MON1012", "type" : "Monitor", "instock" : 85,
  "size" : "Retina display", "resolution" : "1280x800" },
  { "sku" : "MON1031", "type" : "Monitor", "instock" : 60,
  "size" : "23 inch", "display_type" : "LED" }]

  db.collection("ordersDB").insert(orders,function(err, result) {
    if (err) throw err;
    console.log("\nORDERSDB:")
    console.log(orders)
    console.log("\nINVENTORYDB:")
    console.log(inventory)
    var pendingInventory = inventory.length;
    inventory.forEach(function(item){
      db.collection("inventoryDB").insert(item,function(err, result) {
        if (err) throw err;
        if(--pendingInventory === 0){
          db.collection("ordersDB").aggregate([
            {
              $unwind: "$specs"
            },
            {
              $lookup:
                {
                  from: "inventoryDB",
                  localField: "specs",
                  foreignField: "size",
                  as: "inventory_docs"
                }
           },
           {
              $match: { "inventory_docs": { $ne: [] } }
           
          }],function(err,result){
            console.log("GENERAL: ")
            console.log(result)
            console.log("\nINVENTORY_DOCS")
            result.forEach(function(item){
              console.log(item["inventory_docs"])
            })
            //console.log(result[0]["inventory_docs"])
            db.close()
          })        
        }
      })    
    });
  });
  

});