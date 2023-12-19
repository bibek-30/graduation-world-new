const fs = require("fs");
const csv = require("csv-parser");

const filePath = "output.csv";
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
    console.log("data",results)
  });

function processRows(rows) {
  // Process each row with a delay
  rows.reduce((accumulator, row) => {
    return accumulator.then(() => {
      return processRow(row);
    });
  }, Promise.resolve()).then(() => {
    // Save failed requests to a text file
    if (failedRequests.length > 0) {
      fs.writeFileSync(failedRequestsFilePath, failedRequests.join('\n'));
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
          if (result.products[0].title.trim() == row.name.replace("-", ",").trim()) {
            // if (result.products[0].title.trim() == row.name.trim()) {
              console.log(result.products[0].title)
            // const data = createParagraph(row.description.replaceAll("!",'"').replaceAll(';',','));
            const data = row.description.replaceAll("!",'"').replaceAll(';',',');
            // const data = row.color?row.color:" ";
            const name = row.name;
            addMetafields(result.products[0].id, data, name);
          }else{
            console.log("title not matcihng",'shopify:', result.products[0].title, 'vs', 'hamro:', row.name)
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


function addMetafields(productId, data, name) {
  const apiUrl = `https://graduationworld.myshopify.com/admin/api/2023-10/products/${productId}/metafields.json`;

  var raw = JSON.stringify({
    metafield: {
      namespace: "custom",
      key: "products_features",
      value: "",
      type: "rich_text_field",
      owner_id: productId,
      owner_resource: "product",
    },
  });

  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": "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",
    },
    body: raw,
  })
    .then((response) => {
      if (!response.ok) {
        failedRequests.push(name);
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
