const jwt = require("jsonwebtoken");
const config = require("./config");
const rp = require("request-promise");
const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});
app.use(express.json());
var email, userid, resp;
const port = 4000;
const payload = {
  iss: config.APIKey,
  exp: new Date().getTime() + 5000,
};
const token = jwt.sign(payload, config.APISecret);

app.post("/newMeeting", (req, res) => {
  email = "vinurachan@gmail.com";
  // email = "184024H@uom.lk";
  var options = {
    method: "POST",
    uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
    body: {
      topic: req.body.topic,
      type: 1,
      settings: {
        host_video: "true",
        participant_video: "true",
      },
    },
    auth: {
      bearer: token,
    },
    headers: {
      "User-Agent": "Zoom-api-Jwt-Request",
      "content-type": "application/json",
    },
    json: true,
  };

  rp(options)
    .then(function (response) {
      res.status(200).json({
        status: "Successfull",
        Meeting_Details: response,
      });
      console.log(response);
    })
    .catch(function (err) {
      console.log("Meeting Link Generation Failed!, reason- ", err);
    });
});

app.listen(port, () => console.log(`Zoom Server listening on Port: ${port}`));
