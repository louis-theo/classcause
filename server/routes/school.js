const express = require("express");
const router = express.Router();
const environment = process.env.NODE_ENV || "development";
const config = require("../database/knexfile")[environment];
if (!config) {
  console.error(
    `Database configuration for environment '${environment}' not found.`
  );
  process.exit(1);
}
const knex = require("knex")(config);
// To view all school and the city
// GET /api/schools
router.get("/", async (req, res) => {
  try {
    const schools = await knex("Users")
      .distinct("school")
      .join("Address", "Users.addressId", "=", "Address.addressId")
      .select("Users.school", "Address.city");
    res.json(schools);
  } catch (error) {
    res.status(500).json({
      message: `Couldn't retrieve schools: ${error.message}`,
    });
  }
});

// To view all schools in a specific city
// GET /api/schools/city/:cityName
router.get("/city/:city", async (req, res) => {
  const { city } = req.params;
  try {
    const schoolsInCity = await knex("Users")
      .distinct("school")
      .join("Address", "Users.addressId", "=", "Address.addressId")
      .where("Address.city", city)
      .select("Users.school");
    res.json(schoolsInCity);
  } catch (error) {
    res.status(500).json({
      message: `Couldn't retrieve schools in ${city}: ${error.message}`,
    });
  }
});

// To view all teachers at a school
// GET /api/schools/:schoolName/teachers
router.get("/:school/teachers", async (req, res) => {
  const { schoolName } = req.params;
  try {
    const teachers = await knex("Users")
      .where({
        school: schoolName,
        accountType: "teacher",
      })
      .join("Address", "Users.addressId", "=", "Address.addressId")
      .select(
        "Users.userFirstName",
        "Users.userLastName",
        "Users.groupName",
        "Address.city"
      );
    res.json(teachers);
  } catch (error) {
    res.status(500).json({
      message: `Couldn't retrieve teachers at ${school}: ${error.message}`,
    });
  }
});

router.get("/:schoolId", async (req, res) => {
  const { schoolId } = req.params;
  try {
    const schoolInfo = await knex("school").where("schoolId", schoolId).first();
    if (!schoolInfo) {
      return res.status(404).json({ message: "School not found" });
    }
    res.json(schoolInfo);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching school information: ${error.message}` });
  }
});

module.exports = router;
