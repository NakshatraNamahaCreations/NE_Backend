const express = require("express");
const router = express.Router();
const {
  addCity,
  getAllCity,
  getCityById,
  getActiveCities,
  deleteCity,
  activeStatus,
  inActiveStatus,
} = require("../../controllers/master/city");

router.post("/add-city", addCity);
router.get("/get-all-cities", getAllCity);
router.get("/get-city-by-id/:id", getCityById);
router.get("/get-active-cities", getActiveCities);
router.delete("/delete-city/:id", deleteCity);
router.put("/city-active-status/:id", activeStatus);
router.put("/city-inactive-status/:id", inActiveStatus);

module.exports = router;
