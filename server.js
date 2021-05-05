import express from "express"
import mongoose from "mongoose"
import Pusher from "pusher"
import Cors from "cors"
import dbModel from "./dbModel.js";

//app config
const app = express();
const port = process.env.PORT || 8080;
const pusher = new Pusher({
    appId: "1196238",
    key: "10b4518b78ab00ba34b7",
    secret: "5c165dce950f1e5f23c3",
    cluster: "ap2",
    useTLS: true
  });


//middlewares
app.use(express.json());
app.use(Cors());

//DB Config
const connection_url =
"mongodb+srv://admin:jmP8GvnzqEyZ16bz@cluster0.uduy0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,

})
mongoose.connection.once("open", ()=> {
    console.log("DB Connected")

    const changeStrem = mongoose.connection.collection("posts").watch()

    changeStrem.on('change', (change) => {
        console.log("change Triggered to pusher..")
        console.log(change)
        console.log("end of change")

        if(change.operationType === "insert"){
            console.log("Trigger pushing IMG upload")

            const postDetails = change.fullDocument;
            pusher.trigger("posts","inserted", {
                user = postDetails.user,
                caption = postDetails.caption,
                image = postDetails.image
            })
            
        }else{
            console.log("unknown trigger from pusher")
        }
    })
})

//api routes
app.get("/",( req , res) => res.status(200).send("Hello Lipuuuu!!!"));
app.post("/upload",(req,res) => {
    const body = req.body;
    dbModel.create(body,(err,data) => {
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(201).send(data);
        }
    })
})
app.get("/sync",(req,res) => {
    dbModel.find((err,data) => {
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(200).send(data);
        }
    })

})

//listener
app.listen(port, () => console.log(`listening on localhost : ${port}`));