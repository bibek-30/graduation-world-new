const axios = require("axios");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

let count = 0; // Use let instead of const for count

async function downloadImage(imageUrl, image_url) {
  const fileName = path.basename(image_url.replace(/\\/g, "_"));
  const filePath = path.join("images_folder", fileName);

  // Check if the file already exists, if so, skip the download
  if (fs.existsSync(filePath)) {
    console.log(`Image already downloaded at: ${filePath}`);
    return;
  }

  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    if (!fs.existsSync("images_folder")) {
      fs.mkdirSync("images_folder");
    }

    fs.writeFileSync(filePath, Buffer.from(response.data));
    console.log(`Image downloaded and saved at: ${filePath}`);
    count++; // Increment count after successful download
  } catch (error) {
    console.error(`Error downloading image (${count + 1} attempt):`, error.message);

    const logMessage = `${image_url}: ${error.message}\n`;
    fs.appendFileSync("failed_downloads.txt", logMessage);
  }
}


const csvFilePath = "simple.csv";
const data = [];

fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on("data", (row) => {
    data.push(row);
  })
  .on("end", async () => {
    console.log("CSV file successfully processed.");

    const downloadPromises = data.map(async (product) => {
      const image_url = product["image_url"];

      const imageUrl = `https://www.graduationworld.com/media/catalog/product/${image_url}`;
      await downloadImage(imageUrl, image_url);
    });

    try {
      await Promise.all(downloadPromises);
      console.log(`All ${count} images downloaded successfully.`);
    } catch (error) {
      console.error("Some images failed to download.");
    }
  })
  .on("error", (error) => {
    console.error("Error reading CSV file:", error.message);
  });
