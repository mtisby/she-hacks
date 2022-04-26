import mongoose from "mongoose"
import pkg from "passport-local-mongoose"

const passportLocalMongoose = pkg
const Schema = mongoose.Schema;
const UserSchema = new Schema({
    profileImg: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    freeTime: {
        type: String,
        required: false
    },
    friends: {
        type: String,
        required: false
    },
    interests: {
        type: String,
        required: false
    },
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User', UserSchema);
export { User }