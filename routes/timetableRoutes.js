const router = require("express").Router();
const timetable = require("../controllers/timetable");

router.route("/newMeeting").post(timetable.createZoomLink);
router.route("/deletePeriod").post(timetable.notifyDelete);

module.exports = router;
