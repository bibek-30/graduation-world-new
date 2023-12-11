const axios = require("axios");
const fs = require("fs");
const path = require("path");

const csv = require("csv-parser");

count = 0;
const downloadFolder = "Default Images/";
const failedDownloadsFile = "failed_downloads_diplomas.txt";

async function downloadImage(imageUrl, image_url) {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // Replace backslashes with underscores in the image_url
    const fileName = path.basename(image_url.replace(/\\/gi, "_"));
    const filePath = path.join(downloadFolder, fileName);

    // Create the 'images_folder' directory if it doesn't exist
    if (!fs.existsSync(downloadFolder)) {
      fs.mkdirSync(downloadFolder);
    }

    fs.writeFileSync(filePath, Buffer.from(response.data));
    console.log(`Image downloaded and saved at: ${filePath}`);
  } catch (error) {
    console.error("Error downloading image:", error.message);

    const logMessage = `https://www.graduationworld.com/media/catalog/product${image_url}: ${error.message}\n`;
    fs.appendFileSync(failedDownloadsFile, logMessage);
  }
}

const csvFilePath = "data1.csv";

// Create an array to store the data from the CSV file
const data = [];

// Read the CSV file
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (row) => {
    // Process each row of data
    console.log(row);
    data.push(row);
  })
  .on("end", () => {
    // The end event is triggered when all rows have been read
    console.log("CSV file successfully processed.");

    const productsData = data;

    productsData.forEach((product) => {
      const image_url = product["image_url"].trim();

      downloadImage(
        `https://www.graduationworld.com/media/catalog/product${image_url}`,
        image_url
      );

      count++;
    });
  })
  .on("error", (error) => {
    // Handle errors during the reading process
    console.error("Error reading CSV file:", error.message);
  });
