const {
  query,
  where,
  getDocs,
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

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID =
  "568212379264-7brqds1rs0jgqjhdori4hbk881hcpk7p.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04YV52KbkQRL7CgYIARAAGAQSNwF-L9IrKZoAuruOkYHVvUD_hX5TRDg8ptzpJnhOy7DmQM2NhtjiDNQok0HjtYIl8hZM56yOCwI";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

var joinURL = null;

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
      joinURL = response.join_url;
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

      const q = query(
        collection(db, "users"),
        where("class", "==", req.body.class)
      );
      let emails = "";
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        let data = doc.data();
        emails = emails.concat((emails == "" ? "" : ",") + data.email);
      });

      sendMail(emails)
        .then((result) => console.log("Email sent...", result))
        .catch((error) => console.log(error.message));

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

  async function sendMail(emails) {
    try {
      const accessToken = await oAuth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "oAuth2",
          user: "vinurachan@gmail.com",
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

      const mailOptions = {
        from: "Vinurachan ✔😜<vinurachan@gmail.com>",
        to: emails,
        subject: `Zoom Class for ${req.body.topic}`,
        html: `<p>${
          req.body.teacher
        } is inviting you to the online zoom class for ${req.body.subject} on ${
          req.body.day
        }
              period ${req.body.period} at ${req.body.startTime}${
          req.body.period == 7 || req.body.period == 8 ? "PM" : "AM"
        }.
              You can join the session through the following link.</p><br>${joinURL}`,
      };

      const result = await transport.sendMail(mailOptions);
      return result;
    } catch (error) {
      return error;
    }
  }
};

exports.notifyDelete = async (req, res, next) => {
  const q = query(
    collection(db, "users"),
    where("class", "==", req.body.class)
  );
  let emails = "";
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    let data = doc.data();
    emails = emails.concat((emails == "" ? "" : ",") + data.email);
  });
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "oAuth2",
        user: "vinurachan@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "Vinurachan ✔😜<vinurachan@gmail.com>",
      to: emails,
      subject: `Zoom Class Cancellation Notice for ${req.body.topic}`,
      html: `<p>The online zoom class for ${req.body.subject} scheduled on ${
        req.body.day
      } period ${req.body.period}
               at ${req.body.startTime}${
        req.body.period == 7 || req.body.period == 8 ? "PM" : "AM"
      } to the class ${req.body.class} has been cancelled by ${req.body.teacher}
                due to an unavoidable reason.</p>`,
    };

    const result = await transport.sendMail(mailOptions);
    console.log(result);
    return result;
  } catch (error) {
    console.log(error.message);
    return error;
  }
};
