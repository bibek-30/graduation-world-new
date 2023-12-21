const fs = require("fs");
const csv = require("csv-parser");

const filePath = "all.csv";
const failedRequestsFilePath = "failed_requests.txt";
const results = [];
let count = 0;
let failedRequests = [];

fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", () => {
    processRows(results);
    console.log("data", results);
  });

function processRows(rows) {
  // Process each row with a delay
  rows
    .reduce((accumulator, row) => {
      return accumulator.then(() => {
        return processRow(row);
      });
    }, Promise.resolve())
    .then(() => {
      // Save failed requests to a text file
      if (failedRequests.length > 0) {
        fs.writeFileSync(failedRequestsFilePath, failedRequests.join("\n"));
        console.log(`Failed requests saved to ${failedRequestsFilePath}`);
      }
    });
}

function processRow(row) {
  return new Promise((resolve) => {
    let title = row.name.replace("-", ",");
    const productName = title.trim();

    const searchUrl = `https://graduationworld.myshopify.com/admin/api/2022-07/products.json?title=${encodeURIComponent(
      productName
    )}`;

    fetch(searchUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": "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",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        const existingProducts = result.products;
        // console.log(result)

        if (existingProducts.length > 0) {
          if (
            result.products[0].title.trim() == row.name.replace("-", ",").trim()
          ) {
            console.log(result.products[0].title);
            const data = row.fabric.trim();
            const name = row.name;
            addMetafields(result.products[0].id, data, name);
          } else {
            console.log(
              "title not matcihng",
              "shopify:",
              result.products[0].title,
              "vs",
              "hamro:",
              row.name
            );
          }
        } else {
          console.log("Product not found");
          // console.log("fail",result.products[0].title)
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        // Log the failed name to the array
        failedRequests.push(row.name);
      })
      .finally(() => {
        // Delay for 1 or 2 seconds before processing the next row
        setTimeout(resolve, 1000); // Adjust the delay as needed (in milliseconds)
      });
  });
}

// Function to create a text object with or without a bullet
function createText(value, hasBullet) {
  const textObject = {
    type: "text",
    value: value,
  };

  if (hasBullet) {
    textObject.bullet = true;
  }

  return textObject;
}

// Function to create a paragraph object with an array of text objects
function createParagraph(textArray) {
  return {
    type: "paragraph",
    children: textArray,
  };
}

// Main code to create the structure
const textLines = [];

// Create an array of text objects
const textObjects = textLines.map((line) => {
  if (line.startsWith(" &bull,")) {
    return createText(line.substring(8), true);
  } else {
    return createText(line, false);
  }
});

const dynamicStructure = createParagraph(textObjects);

console.log(JSON.stringify(dynamicStructure, null, 2));

function addMetafields(productId, data, name) {
  const apiUrl = `https://graduationworld.myshopify.com/admin/api/2023-10/products/${productId}.json`;

  var raw = JSON.stringify({
    product: {
      product_type: data,
    },
  });

  fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": "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",
    },
    body: raw,
  })
    .then((response) => {
      if (!response.ok) {
        failedRequests.push(name);
        console.log("response   body", JSON.stringify(response));
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      count++;
      console.log("Success:", count, data);
    })
    .catch((error) => {
      console.error("Error:", error);
      failedRequests.push(name);
    });
}
