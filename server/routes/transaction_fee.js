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

// Get historical transaction rates for each account type
router.get("/historical", async (req, res) => {
  try {
    const historicalRates = await knex("FeeHistory")
      .select("accountType", "transactionRate", "updateTime as timeStamp")
      .orderBy(["accountType", { column: "updateTime", order: "asc" }]);

    res.json(historicalRates);
  } catch (error) {
    console.error("Error fetching historical transaction rates:", error);
    res.status(500).send("Server error");
  }
});

router.get("/historical/donations", async (req, res) => {
  try {
    const donationsByAccountTypeOverTime = await knex("Donation")
      .join("Users", "Donation.userId", "=", "Users.userId")
      .select(
        "Users.accountType",
        knex.raw("DATE(Donation.donationTime) as date"),
        knex.raw("SUM(Donation.donationAmount) as totalDonations")
      )
      .groupBy("Users.accountType", knex.raw("DATE(Donation.donationTime)"))
      .orderBy("date", "asc");

    res.json(donationsByAccountTypeOverTime);
  } catch (error) {
    console.error("Error fetching donations by account type over time:", error);
    res.status(500).send("Server error");
  }
});

// Create fee
router.post("/create", async (req, res) => {
  const { accountType, transactionRate } = req.body;

  try {
    const [transactionFeeId] = await knex("TransactionFee").insert({
      accountType,
      transactionRate,
    });
    res.json({ success: true, transactionFeeId: transactionFeeId });
  } catch (error) {
    res.status(500).json({ message: `Couldn't create fee: ${error.message}` });
  }
});

// Update fee (updates specific fee by id)
router.put("/:feeId", async (req, res) => {
  const feeId = req.params.feeId;
  const updates = req.body;

  try {
    const feeExists = await knex("TransactionFee")
      .where({ transactionFeeId: feeId })
      .first();

    if (!feeExists) {
      return res.status(404).json({
        message: `Fee with ID ${feeId} doesn't exist in the database`,
      });
    }

    await knex("TransactionFee")
      .where({ transactionFeeId: feeId })
      .update(updates);
    res.json({ success: true, message: `Fee ${feeId} updated successfully` });
  } catch (error) {
    res.status(500).json({ message: `Couldn't update fee: ${error.message}` });
  }
});

// Delete fee
router.delete("/:feeId", async (req, res) => {
  const feeId = req.params.feeId;

  try {
    await knex("TransactionFee").where({ transactionFeeId: feeId }).del();
    res.json({ success: true, message: `Fee ${feeId} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: `Couldn't delete fee: ${error.message}` });
  }
});

// Single fee info
router.get("/:feeId", async (req, res) => {
  const feeId = req.params.feeId;

  try {
    const fee = await knex("TransactionFee")
      .where({ transactionFeeId: feeId })
      .first();
    if (!fee) {
      return res.status(404).json({
        message: `Fee with ID ${feeId} doesn't exist in the database`,
      });
    }
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: `Couldn't fetch fee: ${error.message}` });
  }
});

// All fees
router.get("", async (req, res) => {
  try {
    const fees = await knex("TransactionFee").select("*");
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: `Couldn't fetch fees: ${error.message}` });
  }
});

// Get latest transaction fee by account type
router.get("/latest/:accountType", async (req, res) => {
  const { accountType } = req.params;

  try {
    const latestFee = await knex("TransactionFee")
      .where({ accountType })
      .orderBy("timeStamp", "desc")
      .first();

    if (!latestFee) {
      return res.status(404).json({
        message: "Transaction fee for specified account type not found",
      });
    }

    res.json({ transactionRate: latestFee.transactionRate });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching transaction fee: ${error.message}` });
  }
});

// Endpoint to get all fees for parents
router.get("/fees/parents", async (req, res) => {
  try {
    const fees = await knex("TransactionFee").where("accountType", "parent");
    res.json(fees);
  } catch (error) {
    res
      .status(500)
      .send({ message: `Error fetching fees for parents: ${error.message}` });
  }
});

// Endpoint to get all fees for businesses
router.get("/fees/businesses", async (req, res) => {
  try {
    const fees = await knex("TransactionFee").where("accountType", "business");
    res.json(fees);
  } catch (error) {
    res.status(500).send({
      message: `Error fetching fees for businesses: ${error.message}`,
    });
  }
});

// Endpoint to get all fees for teachers
router.get("/fees/teachers", async (req, res) => {
  try {
    const fees = await knex("TransactionFee").where("accountType", "teacher");
    res.json(fees);
  } catch (error) {
    res
      .status(500)
      .send({ message: `Error fetching fees for teachers: ${error.message}` });
  }
});

router.put("/fees/update", async (req, res) => {
  const { accountType, newRate } = req.body;

  if (!accountType || newRate === undefined) {
    return res
      .status(400)
      .json({ message: "Please provide both accountType and newRate." });
  }

  // Begin a transaction to ensure data integrity
  const trx = await knex.transaction();

  try {
    // Check if the fee entry exists for the given accountType
    const feeEntry = await trx("TransactionFee")
      .where("accountType", accountType)
      .first();
    if (!feeEntry) {
      await trx.rollback();
      return res
        .status(404)
        .json({ message: `No fees found for account type: ${accountType}` });
    }

    // Update the current rate in the TransactionFee table
    await trx("TransactionFee").where("accountType", accountType).update({
      transactionRate: newRate,
      timeStamp: knex.fn.now(),
    });

    // Log the change in the FeeHistory table
    await trx("FeeHistory").insert({
      accountType,
      transactionRate: newRate,
      updateTime: knex.fn.now(),
    });

    // Commit the transaction
    await trx.commit();

    res.json({
      success: true,
      message: `Transaction rates for ${accountType} updated successfully to ${newRate}%`,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await trx.rollback();
    res.status(500).json({
      message: `Error updating fees for ${accountType}: ${error.message}`,
    });
  }
});

module.exports = router;
