const fs = require("fs");
const path = require("path");

// Define file paths
const jsonlFilePath = path.join(__dirname, "cot_1745781648056.jsonl");
const jsonFilePath = path.join(__dirname, "cot_1745781648056.json");

// Read the .jsonl file
fs.readFile(jsonlFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading .jsonl file:", err);
    return;
  }

  // Split the file into lines and parse each line as JSON
  const jsonArray = data
    .split("\n")
    .filter(line => line.trim() !== "") // Remove empty lines
    .map(line => JSON.parse(line));

  // Write the JSON array to a .json file
  fs.writeFile(jsonFilePath, JSON.stringify(jsonArray, null, 2), "utf8", err => {
    if (err) {
      console.error("Error writing .json file:", err);
    } else {
      console.log("Successfully converted .jsonl to .json:", jsonFilePath);
    }
  });
});
