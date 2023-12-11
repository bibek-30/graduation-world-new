const fs = require("fs");
const csv = require("csv-parser");

const filePath = "data.csv";

const results = [];

fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (data) => {
    results.push(data);
  })
  .on("end", () => {
    results.forEach((row) => {
      let title = row.name;
      let images = row.image_url;
      let new_image =
        "https://cdn.shopify.com/s/files/1/0785/1792/8236/files/" +
        images.substring(images.lastIndexOf("/") + 1);

      let price = row.price;
      let description = row.description;

      const productName = title;

      const searchUrl = `https://bibek-test-store.myshopify.com/admin/api/2022-07/products.json?title=${encodeURIComponent(
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
          if (existingProducts.length > 0) {
            console.log(`${result.products[0].title} Product already exists!`);
          } else {
            addProducts();
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      function addProducts() {
        var myHeaders = new Headers();
        myHeaders.append(
          "X-Shopify-Access-Token",
          "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"
        );
        myHeaders.append("Content-Type", "application/json");

        var raw = JSON.stringify({
          product: {
            title: title,
            body_html: description,
            vendor: "Graduation World",
            product_type: "Uniforms",
            price: price,
          },
        });

        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        fetch(
          "https://bibek-test-store.myshopify.com/admin/api/2023-07/products.json",
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            const id = result.product.id;
            addImages(id);
          })
          .catch((error) => console.log("error", error));
      }

      function addImages(id) {
        const apiUrl = `https://bibek-test-store.myshopify.com//admin/api/2023-10/products/${id}/images.json`;
        const requestBody = {
          image: {
            src: "https://cdn.shopify.com/s/files/1/0785/1792/8236/files/silver_preschool_gown_cap_tassel_2018.jpg",
          },
        };

        fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": "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",
          },
          body: JSON.stringify(requestBody),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log("Success:", data);
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    });
  });
