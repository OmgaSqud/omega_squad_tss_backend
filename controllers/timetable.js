const {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} = require("firebase/firestore");
const db = require("../firebase/firebase");
const jwt = require("jsonwebtoken");
const config = require("../config");
const rp = require("request-promise");

const payload = {
  iss: config.APIKey,
  exp: new Date().getTime() + 5000,
};
const token = jwt.sign(payload, config.APISecret);

exports.createZoomLink = async (req, res, next) => {
  const slotID = req.body.slotID;
  var email = "vinurachan@gmail.com";
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
    .then(async function (response) {
      if (!req.body.isUpdate) {
        await addDoc(collection(db, "timeslots"), {
          dateTime: serverTimestamp(),
          class: req.body.class,
          day: req.body.day,
          startlink: response.start_url,
          joinlink: response.join_url,
          period: req.body.period,
          startTime: req.body.startTime,
          subject: req.body.subject,
          teacher: req.body.teacher,
        });
      } else {
        const update = doc(db, "timeslots", slotID);
        await updateDoc(update, {
          dateTime: serverTimestamp(),
          class: req.body.class,
          startlink: response.start_url,
          joinlink: response.join_url,
        });
      }
      res.status(200).json({
        status: "Successfull",
        Meeting_Details: response,
      });
      console.log(req.body);
      console.log(response);
    })
    .catch(function (err) {
      console.log("Meeting Link Generation Failed!, reason- ", err);
    });
};
