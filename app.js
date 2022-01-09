import dotenv from "dotenv"

if (process.env.NODE_ENV !== "productions") {
    dotenv.config()
}

/* express dependencies */
import express from "express";
import session from "express-session";
import mongoSanitize from 'express-mongo-sanitize';

/* mongoose dependencies */
import mongoose from "mongoose"
import MongoStore from "connect-mongo"

/* passport dependencies */
import passport from 'passport'
import LocalStrategy from 'passport-local'

/* templating dependencies */
import methodOverride from "method-override"
import ejsMate from 'ejs-mate';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import flash from "connect-flash";

/* model */
import { User } from './models/user.js'

const dbUrl = process.env.DB_URL ||'mongodb://localhost:27017/she-hacks';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
const port = process.env.PORT || 3060;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use(express.static(__dirname + '/public'));
app.use(mongoSanitize({
    replaceWith: "_"
}))

const secret = process.env.SECRET;

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret
    }
});

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res) => {
    res.render('./home.ejs')
})

app.get('/login', (req, res) => {
    res.render('./users/login.ejs')
})

app.post('/login', (req, res) => {
    console.log(req)
})

app.listen(port, () => {
    console.log(`listening on : ${port}`)
})