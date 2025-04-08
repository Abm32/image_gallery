const express = require("express");
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse');
const xlsx = require('xlsx');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

router.use((req, res, next) => {
  req.pool = req.app.get("db");
  next();
});

router.post("/mitems/import", upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const pool = req.pool;
    let records = [];

    if (req.file.originalname.endsWith('.csv')) {
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      records = await new Promise((resolve, reject) => {
        csv.parse(fileContent, {
          columns: true,
          skip_empty_lines: true
        }, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    } else if (req.file.originalname.endsWith('.ods')) {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      records = xlsx.utils.sheet_to_json(worksheet);
    }

    for (const record of records) {
      // Get CategoryID from CategoryName if provided
      let categoryId = record.CategoryID;
      if (record.CategoryName && !categoryId) {
        const [categoryResult] = await pool.query(
          'SELECT CategoryID FROM MCategory WHERE CategoryName = ?',
          [record.CategoryName]
        );
        if (categoryResult.length > 0) {
          categoryId = categoryResult[0].CategoryID;
        }
      }

      // Get UnitID from UnitName if provided
      let unitId = record.AccountingUnitID;
      if (record.UnitName && !unitId) {
        const [unitResult] = await pool.query(
          'SELECT UnitID FROM MAu WHERE UnitName = ?',
          [record.UnitName]
        );
        if (unitResult.length > 0) {
          unitId = unitResult[0].UnitID;
        }
      }

      if (categoryId && unitId) {
        await pool.query(
          'INSERT INTO MItem (CategoryID, ItemName, Description, AccountingUnitID) VALUES (?, ?, ?, ?)',
          [categoryId, record.ItemName, record.Description, unitId]
        );
      }
    }

    fs.unlinkSync(req.file.path);
    res.json({ message: `Successfully imported ${records.length} records` });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: "Error importing file" });
  }
});
// API endpoint to get data from MItem table
router.get("/mitems", async (req, res) => {
  try {
    const query = `
    SELECT 
      MItem.ItemID,
      MItem.CategoryID,
      MItem.ItemName,
      MItem.Description,
      MItem.AccountingUnitID,
      MCategory.CategoryName,
      MAu.UnitName
    FROM 
      MItem
    LEFT JOIN 
      MCategory ON MItem.CategoryID = MCategory.CategoryID
    LEFT JOIN 
      MAu ON MItem.AccountingUnitID = MAu.UnitID
  `;
    const [results] = await req.pool.query(query); // Ensure destructured format for query results
    res.json(results); // Return only the query results
  } catch (err) {
    console.error("Error fetching projects:", err);
    res.status(500).json({ error: "Failed to fetch data from the database." });
  }
});

// Route to add a new item
router.post("/mitems", async (req, res) => {
  const {
    CategoryID,
    ItemName,
    Description,
    AccountingUnitID,
    EnteredBy
  } = req.body;

  // Check if all required fields are provided
  if (
    !CategoryID ||
    !ItemName ||
    !Description ||
    !AccountingUnitID ||
    !EnteredBy
   ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {

    const [mauid] = await req.pool.query(
      "SELECT UnitID FROM MAu WHERE UnitName = ?",
      [AccountingUnitID]
    );
    if (!mauid || mauid.length === 0) {
      console.error(`Unit not found for AccountingUnit: ${AccountingUnitID}`);
      return res.status(404).json({ error: "Invalid Unit." });
    }
    const MauID = mauid[0].UnitID;

    // Insert data into MItem
    const query = `
      INSERT INTO MItem (
        CategoryID,
        ItemName,
        Description,
        AccountingUnitID,
        EnteredBy
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await req.pool.query(query, [
      CategoryID,
      ItemName,
      Description,
      MauID,
      EnteredBy
    ]);

    res.status(201).json({
      message: "Item added successfully!",
      projectId: result.insertId,
    });
  } catch (err) {
    console.error("Error inserting item:", err.message);
    res.status(500).json({ error: "Failed to add item." });
  }
});

router.put("/mitems/:id", async (req, res) => {
  const { id } = req.params;

  const {
    CategoryID,
    ItemName,
    Description,
    AccountingUnitID
  } = req.body;

  // Check if all required fields are provided
  if (
    !CategoryID ||
    !ItemName ||
    !Description ||
    !AccountingUnitID
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {

    // Proceed to update the project
    const updateQuery = `
      UPDATE MItem 
      SET 
        CategoryID = ?,
        ItemName = ?,
        Description = ?,
        AccountingUnitID = ?
      WHERE ItemID = ?
    `;

    const [updateResult] = await req.pool.query(updateQuery, [
      CategoryID,
      ItemName,
      Description,
      AccountingUnitID,
      id,
    ]); 

    if (updateResult.affectedRows === 0) {
      console.error(`No item found with ID: ${id}`);
      return res.status(404).json({ error: "Item not found or no changes made." });
    }

    res.status(200).json({ message: "Item updated successfully!" });
  } catch (err) {
    console.error("Database Error:", err.message);
    res.status(500).json({ error: "An unexpected error occurred while updating the item." });
  }
});



// Route to delete a project
router.delete("/mitems/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the project exists
    const [result] = await req.pool.query("SELECT * FROM MItem WHERE ItemID = ?", [id]);

    if (result.length === 0) {
      return res.status(404).send("Item not found");
    }

    // Delete the location
    const deleteQuery = "DELETE FROM MItem WHERE ItemID = ?";
    await req.pool.query(deleteQuery, [id]);

    res.send("Item deleted successfully");
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = router;
