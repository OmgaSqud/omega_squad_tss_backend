const router = require("express").Router();
const timetable = require("../controllers/timetable");

router.route("/newMeeting").post(timetable.createZoomLink);

module.exports = router;
