import mongoose from "mongoose"
import { User } from "../models/user.js";
import { data } from "./seedHelper.js"
import dotenv from "dotenv"
dotenv.config({ path: "../.env" })

const dbUrl = process.env.DB_URL 

mongoose.connect(dbUrl);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


// let nameInd = Math.floor(Math.random() * 28);
// let titleInd = Math.floor(Math.random() * 20);
// let schoolInd = Math.floor(Math.random() * 70);
// let questionInd = Math.floor(Math.random() * 5);
// console.log(data['firstNames'][nameInd])

const seedDB = async () => {
    await User.deleteMany({});

    for (let i = 0; i < 100; i++) {
        let nameInd = Math.floor(Math.random() * 28);
        let titleInd = Math.floor(Math.random() * 20);
        let schoolInd = Math.floor(Math.random() * 70);
        let questionInd = Math.floor(Math.random() * 5);

        let firstNames = data['firstNames'][nameInd]
        let lastNames = data['lastNames'][nameInd]
        let username = firstNames[0]+lastNames
        
        const user = new User({
            username: username,
            firstName: firstNames,
            lastName: lastNames,
            title: data['title'][titleInd],
            school: data['school'][schoolInd],
            freeTime: data['freeTime'][questionInd],
            freinds: data['friends'][questionInd],
            interests: data['interests'][questionInd],
            energyLevel: data['energyLevel'][questionInd]
          })
        await user.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

