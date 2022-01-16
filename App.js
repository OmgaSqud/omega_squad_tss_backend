const port = process.env.PORT || 4000;
const express = require("express");
const app = express();

//Import Routes
const timetableRoutes = require("./routes/timetableRoutes");

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

//User Routes
app.use("/timetable", timetableRoutes);

app.listen(port, () => console.log(`Zoom Server listening on Port: ${port}`));
