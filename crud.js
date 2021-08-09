const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const { ObjectID } = require('bson')
app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.json());
var obj;
const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'devs';
var roomid;
var LENGTH_1 = 0; 
var find_storage_id = [];
var room_id_list1 = [];
var room_id;
var storage_id;
var item_id_list = new Array();
item_id_list = [];
var flag = 0;
var entered = 0;



app.route('/home')
  .get((req, res) => getValues(req, res))
  .post((req, res) => insertValues_room(req, res))
app.route('/home/delete')
  .post((req, res) => delete_room(req, res))

// app.route('/home/checkRoomNotTaken')
//   .get((req, res) => checkRoomNotTaken(req, res))
app.route('/home/search')
  .post((req,res)=> search_item1(req,res))

  
search_item1 = (req,res) =>{
  var room_sto = []
  var obj_room = {}
  search_item = req.body.item
  var ids_name = []
  var Final_room = {}
  
 
    console.log("IM HERE")
    
    mongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {
      const db = client.db(databaseName);
      if (error) {
        return console.log(error)
      }
      
    let regex = new RegExp(`^${search_item}`);
    db.collection("Items1").find({item_name : regex}).toArray()
    .then(result=>{console.log(result)
      var item_object = result;
      // console.log(item_object[0]._id)
      //getting all the item ids into an array
      var item_ids = [] //ITEM IDS ARRAY
      var item_names = []
      for(var i=0;i<item_object.length;i++){
        item_ids[i] = item_object[i]._id
        item_names[i] = item_object[i].item_name
        //console.log(item_ids[i])
      }
      
      const searching = async() => {
        var room_objects = await db.collection("Room1").find().toArray()
        var storage_id = []
        var storage_name = []
        var storage_objects = await db.collection("Storage1").find().toArray();
        console.log(storage_objects)
        var storage_ids = {}
        for(var i=0;i<storage_objects.length;i++){
          for (var j=0;j<item_ids.length;j++){
            if(JSON.stringify(storage_objects[i].item_ids).includes(JSON.stringify(item_ids[j]))){
              //console.log("FOUND A MATCH" + storage_objects[i].storage_name)
              if(!((storage_objects[i].storage_name) in storage_ids)){
              storage_ids[storage_objects[i].storage_name] = [];
              storage_id.push(storage_objects[i]._id)
              storage_name.push(storage_objects[i].storage_name)
              }
              
              console.log(item_names[j])
              storage_ids[storage_objects[i].storage_name].push(item_names[j])
              //console.log(storage_ids)
              //console.log(storage_id)


            }

            
          
            
          }
          
        }

        console.log("STORAGEIDS   " + storage_id)
        console.log(storage_name)
        
        var sto_item = {}
        var count = 0
        while(count<storage_id.length){
          for(var i=0;i<room_objects.length;i++){
            if(JSON.stringify(room_objects[i].Storage_id).includes(JSON.stringify(storage_id[count]))){
              if(!((room_objects[i].Room_name) in Final_room)){
                Final_room[room_objects[i].Room_name] = []
                
                Final_room[room_objects[i].Room_name].push(storage_name[count])
                Final_room[room_objects[i].Room_name].push(storage_ids[storage_name[count]])
                
                console.log(storage_name[count])
                count++
              }
              else{
                Final_room[room_objects[i].Room_name].push(storage_name[count])
                Final_room[room_objects[i].Room_name].push(storage_ids[storage_name[count]])
                
                console.log(storage_name[count])
                count++
              }
              break
            }
          }
        }
          
       
     


  console.log(Final_room)
  console.log("SENDING" + Final_room)
  res.send(Final_room)

      }

    searching();
    
    
    })
      
  

    })

 
}



checkRoomNotTaken = (req, res) => {

  mongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {

    if (error) {
      return console.log(error)
    }

    db.collection('Room1').findOne({ Room_name: obj.Room_name })
      .then(result => {

        if (!result) {
          return res.json({ Room_taken: false })
        }

        else {
          return res.json({ Room_taken: true })
        }

      })
  })

}




delete_room = (req, res) => {
  mongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {

    if (error) {
      return console.log(error)
    }

    const db = client.db(databaseName);

    //var obj = JSON.parse(JSON.stringify(req.body));
    var obj = req.body._id;

    console.log(obj)
    const delete_rooms = async () => {


      var id = obj
      console.log("RECIEVED ID IS" + id)
      var storage_ids = [];
      var room = []
      var items_id = [];
      var room = await db.collection("Room1").findOne({ _id: ObjectID(id) });
      console.log("Found a room")  
      if (room.Storage_id.length == 0) {
        console.log("ROOM STORAGE ID = 0")
        var rom_id = room._id
        await db.collection("Room1").deleteOne({ _id: ObjectID(rom_id) })
      }


      //console.log("ROOM LENGTH" + room.Storage_id)
      // if(room.Storage_id.length>0){
      else {
        console.log("Room mai storage hai")
        storage_ids = room.Storage_id;
        //console.log("The storage ids are" + storage_ids);

        for (var i = 0; i < storage_ids.length; i++) {
          var ids = storage_ids[i]
          var storage = await db.collection("Storage1").findOne({ _id: ObjectID(ids) })

          console.log(storage);
          if (storage.item_ids.length == 0) {
            console.log("ITEM NAI HAI")
            var stor_id = storage._id
            await db.collection("Storage1").deleteOne({ _id: ObjectID(stor_id) })
          }
          else {
            console.log("ITEM HAI MUJH MAI")
            for (var j = 0; j < storage.item_ids.length; j++) {

              var item_id = storage.item_ids[j];

              var item_found = await db.collection("Items1").deleteOne({ _id: ObjectID(item_id) })

              //console.log("ITEM " + item_id + "DELETED")


            }

            var stor_id = storage._id
            await db.collection("Storage1").deleteOne({ _id: ObjectID(stor_id) })
            // console.log("Storage also gone")
          }

        }
        var rom_id = room._id
        await db.collection("Room1").deleteOne({ _id: ObjectID(rom_id) })
        // console.log("Room deleted too")

        // }

        // var rom_id = room._id
        //  await db.collection("Room1").deleteOne({_id:ObjectID(rom_id)})
        //  console.log("ONLY ROOM DELETED")

      }

    }

    delete_rooms();

  })

}


// app.get('/with-cors', cors(), (req, res, next) => {
//     res.json({ msg: 'WHOAH with CORS it works! 🔝 🎉' })
//   })
insertValues_room = (req, res) => {


  console.log("Entering");
  mongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {

    if (error) {
      return console.log(error)
    }

    const db = client.db(databaseName);
    //console.log(req);
    //res.send(req.body);
    var obj = JSON.parse(JSON.stringify(req.body));
    console.log(obj);
    var roomName = obj.Room_name;
    var roomDescription = obj.Description;
    var roomStorageList = obj.storage_area;
    var roomStorageName = obj.storage_name;
    var roomItemsIDList = obj.items;
    var roomItemNameList = obj.item_name;
    var storage_list = obj.Storage_name_list;
    console.log("ROOM NAME:" + roomName);
    console.log("Description:" + roomDescription);
    console.log("Storages:" + roomStorageList);
    console.log("Storage Name:" + roomStorageName);
    console.log("Item ID List:" + roomItemsIDList);
    console.log("Item name List" + roomItemNameList);
    item_id_list = [];

    var room = obj.Room_name;

    var object_room = {
      Room_name: obj.Room_name,
      Description: obj.Description,
      Storage: obj.storage_area,


    }
    //console.log("OBJECT RECIEVED IS" + object_room);



    db.collection('Room1').findOne({ Room_name: obj.Room_name })
      .then(result => {
        if (result) {
          console.log("In IF" + roomStorageName);
          console.log(result);
          room_id = result._id;
          func();
        }
        else {
          console.log("In else");
          db.collection('Room1').insertOne
            ({
              Room_name: roomName,
              Description: roomDescription,
              Storage_id: []
            }, { unique: true },
              function (err, docsInserted) {
                room_id = docsInserted.ops[0]._id;
                console.log(room_id);

              }
            )

          func();
        }
      })



    const func = async () => {
      entered = 0;
      item_insert();
      await sleep(100);
      Storage_insert();
      await sleep(100);
      Room_Storage();

    }

  





    function item_insert() {

      for (var i = 0; i < roomItemNameList.length; i++) {

        db.collection('Items1').insertOne
          ({ item_name: roomItemNameList[i] }, { unique: true }, function (err, docsInserted) {
            console.log("ITEM ID" + docsInserted.ops[0]._id)
            item_id_list.push(docsInserted.ops[0]._id);
            console.log("Values" + item_id_list[0]);
          })

      }

    }

    function sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }


    const Storage_insert = async () => {

      //console.log("ITEM_ID" + item_id_list[0]);
      await db.collection('Storage1').insertOne
        ({
          storage_name: roomStorageName,
          item_ids: []
        }, { unique: true }, function (err, docsinserted) {
          storage_id = docsinserted.ops[0]._id;
          console.log(storage_id + "is the id of the storage")
        })


      await sleep(100)
      for (var i = 0; i < item_id_list.length; i++) {
        console.log("STORAGE ID" + storage_id);
        var value = item_id_list[i];
        db.collection('Storage1').updateOne({ _id: storage_id }, { $push: { "item_ids": value } }, function (err, res) {
          if (err) throw err;
          console.log("Storage document updated");

        })

      }

    }

    item_id_list = [];

    function Room_Storage() {


      db.collection('Room1').updateOne({ _id: room_id }, { $push: { "Storage_id": storage_id } }, function (err, res) {
        if (err) throw err;
        console.log("Room document updated");

      })
    }

  }

  )

}













getValues = (req, res) => {
  console.log("Inside node get values");
  mongoClient.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology: true }, (error, client) => {

    if (error) {
      return console.log(error)

    }

    const db = client.db(databaseName)
    console.log('Connected successfully!!!')




    const fetch_storgae_ids = async () => {

      let room_objects = await db.collection("Room1").find().toArray();
      let room_new_objects = [];


      for (var i = 0; i < room_objects.length; i++) {
        let room_new_object_val =
        {
          _id: room_objects[i]._id,
          Room_name: room_objects[i].Room_name,
          Description: room_objects[i].Description,
          Storage_id: room_objects[i].Storage_id,
          Storage_name_list: [],
          Item_name_list: []

        };

        var item_names = []
        let storage_names = await db.collection("Storage1").find({ _id: { $in: room_new_object_val.Storage_id } }).toArray();
        for (var j = 0; j < storage_names.length; j++) {
          item_names = [];
          room_new_object_val.Storage_name_list.push(storage_names[j].storage_name);
          var item_name = await db.collection("Items1").find({ _id: { $in: storage_names[j].item_ids } }, { item_name: 0 }).toArray();
          for (var k = 0; k < item_name.length; k++) {
            //console.log("ITEM NAME" + k + item_name[k].item_name)
            item_names.push(item_name[k].item_name)
            //console.log("HERELOL" + item_names)
          }
          if (item_names.length > 0) {
            room_new_object_val.Item_name_list.push(item_names)
          }

        }

        room_new_objects.push(room_new_object_val);


        //console.log("ITEM NAMESS" + item_names)


      }


      //console.log(room_new_objects[1].Item_name_list.length)
      res.send(room_new_objects);


    }
    fetch_storgae_ids();











  })

}





//}

app.use(express.json({
  type: ['application/json', 'text/plain']
}))

app.listen(3080, () => {
  console.log("Hello, connected");
});

