const path =require('path')
const express=require('express');
const mongoose=require('mongoose')
const exphbs=require('express-handlebars')
const morgan=require('morgan')
const homePage=require('./routes/index')
const auth=require('./routes/auth')
const stories=require('./routes/stories')
const methodOverride=require('method-override')
const passport=require('passport')
const session=require('express-session')
const MongoStore=require('connect-mongo')(session)
require('./db/mongoose')
require('./middleware/passport')(passport)

const viewspath=path.join(__dirname,'../tempelates/views')
const partialpath=path.join(__dirname,'../tempelates/partials')
const publicDir=path.join(__dirname,'../public')


const app = express();

// app.use(morgan('dev'))

//handlebars helpers

const {formatDate,stripTags,truncate,editIcon,select}=require('./helpers/hbs')

app.engine('.hbs',exphbs({helpers:{
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
},defaultLayout: 'main',extname:'.hbs'}));
app.set('view engine','.hbs');


//body parser

app.use(express.urlencoded({extended:false}))
app.use(express.json())


//methode overide
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      var method = req.body._method
      delete req.body._method
      return method
    }
  }))


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
}))



//passport middleware
app.use(passport.initialize())
app.use(passport.session())


//set global var middleware
app.use(function(req,res,next){
    res.locals.user=req.user || null;
    next()
})


app.set('views',viewspath)
app.set('partials',partialpath)
app.use(express.static(publicDir))




app.use(homePage);
app.use('/auth',auth);
app.use('/stories',stories);







const port =process.env.PORT

app.listen(port,()=>{
    console.log('Server is up on PORT : '+port)
})