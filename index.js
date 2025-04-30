const express = require("express");
const connectToMongoDB  = require('./connect')
const path = require('path')
const URL = require('./models/url');
const cookieParser = require('cookie-parser')
const { checkForAuthentication , restrictTo} = require('./middlewares/auth')

const urlRoute = require('./routes/url')
const staticRoute = require('./routes/staticRoute')
const userRoute = require('./routes/user')

const app = express();


connectToMongoDB()
.then (()=> console.log("MongoDB connected"))

app.set("view engine" , "ejs")
app.set("views" , path.resolve("./views"))

app.use(express.json())
app.use(express.urlencoded({extended:false})) //for form data
app.use(cookieParser())
app.use(checkForAuthentication)

app.use("/url" ,restrictTo(["NORMAL"])  , urlRoute)
app.use("/" , staticRoute)
app.use("/user", userRoute)

// Server Side Rendering -> 
// Write html on server side -> complicated
// For ease we use EJS
app.get('/test' , async(req , res)=>{
  const allUrls = await URL.find({});
  // return res.end(`
  //   <html>
  //     <head></head>
  //     <body>
  //       <ol>
  //         ${allUrls.map( url => `<li>
  //           ${url.shortId} - 
  //           ${url.redirectURL} - 
  //           ${url.visitHistory.length}</li>`
  //           ).join("")
  //           }
  //       </ol>
  //     </body>
  //   </html>`
    
  // )
  
  return res.render('home',{
    urls: allUrls,
  })
})



app.get("/url/:shortId", async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
      {
        shortId : shortId,
      },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      }
    );
    res.redirect(entry.redirectURL); 
 });

 const PORT = process.env.PORT || 8000;
 app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));