import * as express from "express";
import * as http from "http";
import * as path from "path";

const app = express();
app.use(express.static(`${__dirname}/public`));
app.get("*", (_req, res, next) => {
    if (res.headersSent) {
        next();
        return;
    }
    res.sendFile(path.resolve(__dirname + "/public/index.html"));
});

http.createServer(app).listen(8000, () => {
    console.log("listening on 8000")
})
