const {MongoClient} = require("mongodb");
const mongoose = require("mongoose");

module.exports = {
    selectedDb:{},
    async connect(){
        try{
            console.log("Welcome:: "+process.env.MONGO_DRIVER);
            const client = await MongoClient.connect(process.env.MONGO_DRIVER);
            this.selectedDb = client.db("capacityplanningDB");
            console.log(this.selectedDb);
        }catch(e){
            console.log(e);
        }
    }
}

