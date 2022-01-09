import mongoose from "mongoose"
import Users from "../models/user.js";
import { data } from "./seedHelper.js"
import dotenv from "dotenv"
dotenv.config({ path: ".env" })

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/star-campsites';

mongoose.connect(dbUrl);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDB = async () => {
    await Users.deleteMany({});

    let nameInd = Math.floor(Math.random() * 28);
    let titleInd = Math.floor(Math.random() * 20);
    let schoolInd = Math.floor(Math.random() * 70);
    let questionInd = Math.floor(Math.random() * 5);

    let firstName = data['firstName'][nameInd]
    let lastName = data['lastName'][nameInd]
    let username = firstName[0]+lastName

    for (let i = 0; i < 15; i++) {
        
        const user = new Users({
            username: username,
            firstName: firstName,
            lastName: lastName,
            title: data['title'][titleInd],
            school: data['school'][schoolInd],
            questionOne: data['questionOne'][questionInd],
            questionTwo: data['questionTwo'][questionInd]
          })
        await user.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})

