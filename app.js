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

app.get('/matched', async (req, res) => {
    let userID = req.user._id;
    const user = await User.findById(userID);
    let userInterest = user.interests;

    let match = await User.find({'interest': userInterest})
    match = match[0]
    res.render('./match.ejs', { match })
})

app.get('/login', (req, res) => {
    res.render('./users/login.ejs')
})

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    res.redirect('/profile')
})

app.post('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Goodbye!");
    res.redirect('/');
})

app.get('/register', (req, res) => {
    res.render('./users/register.ejs')
})

app.get('/profile', (req, res) => {
    let user = req.user
    res.render('./profile.ejs', {user})
})

app.get('/matches', async (req, res) => {
    let userID = req.user._id;
    const user = await User.findById(userID);

    let matchOne = await User.find({'interest': user.interests})
    let matchTwo = await User.find({'school': user.school})
    let matchThree = await User.find({'school': user.friends})
    
    let matches = [matchOne, matchTwo, matchThree]
    let newMatches = [];
    for (var i = 0; i < matches.length; i++){
        if(matches.length < 1){
            matches.splice(i, 1)
        }

        for(var j = 0; j < matches[i].length; j++){
            newMatches.push(matches[i][j])
        }
    }

    newMatches = newMatches.slice(0,3)
    res.render('./matches.ejs', {newMatches})
})

app.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, username, title, school, password } = req.body;
        const user = new User({ firstName, lastName, username, title, school});
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, error => {
            if (error) {
                return next(error)
            } else {
                req.flash('success', 'Welcome sheNetworks')
                res.redirect('/questionnaire/home') 
            }
        })
    } catch (e) {
        console.log(e)
        req.flash('error', e.message);
    }
    
})

app.get('/questionnaire/home', (req, res) => {
    res.render('./questionnaireHome.ejs')
})
app.get('/questionnaire/q', (req, res) => {
    res.render('./questionnaire.ejs')
})
app.post('/questionnaire/q', async (req, res) => {
    let userID = req.user._id;
    const user = await User.findById(userID);
    user.freeTime = req.body.freeTime;
    user.interests = req.body.interests;
    user.friends = req.body.friends;
    user.energyLevel = req.body.energyLevel;

    user.save()

    res.redirect('/matched')
})



app.listen(port, () => {
    console.log(`listening on : ${port}`)
})