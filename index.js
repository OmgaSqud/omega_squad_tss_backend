require("dotenv").config();
const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.options("*", cors());

app.post("/", (req, res) => {
  const timestamp = new Date().getTime() - 30000;
  const msg = Buffer.from(
    process.env.ZOOM_JWT_API_KEY +
      req.body.meetingNumber +
      timestamp +
      req.body.role
  ).toString("base64");
  const hash = crypto
    .createHmac("sha256", process.env.ZOOM_JWT_API_SECRET)
    .update(msg)
    .digest("base64");
  const signature = Buffer.from(
    `${process.env.ZOOM_JWT_API_KEY}.${req.body.meetingNumber}.${timestamp}.${req.body.role}.${hash}`
  ).toString("base64");

  res.json({
    signature: signature,
  });
});

app.listen(port, () =>
  console.log(`zoom-signature-server running on port ${port}!`)
);
