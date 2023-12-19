// const fs = require("fs");
// const csv = require("csv-parser");
// const { exit } = require("process");

// const filePath = "magento_products.csv";
// const uniqueNames = new Map();
// const outputFilePath = "caps with tassel products.csv";

// push = true;
// count = 0;
// let currentKey = null;

// productCount = 0;

// const productsObj = {};
// fs.createReadStream(filePath)
//   .pipe(csv())
//   .on("data", (data) => {
//     count++;
//     // if (count > 2000) return;

//     if (
//       data.name !== "" &&
//       data.visibility == 4 &&
//       data._attribute_set == "Cap, Gown & Tassel Sets"
//     ) {
//       // console.log(data.name);
//       push = true;
//       productCount++;
//       currentKey = data._custom_option_title.trim();
//       productsObj[productCount] = {};
//       productsObj[productCount]["name"] = data.name.replace(",", "-");;
//       productsObj[productCount][currentKey] = [
//         data._custom_option_row_title.trim(),
//       ];
//     } else {
//       if (data.name !== "") {
//         push = false;
//         return;
//       }
//       if (push) {
//         if (
//           data._custom_option_title !== null &&
//           data._custom_option_type == "drop_down"
//         ) {
//           currentKey = data._custom_option_title.trim();
//           productsObj[productCount][currentKey] = [
//             data._custom_option_row_title.trim(),
//           ];
//         } else {
//           if (data._custom_option_row_title.includes("Year")) {
//             return;
//           } else {
//             productsObj[productCount][currentKey].push(
//               data?._custom_option_row_title.trim()
//             );
//           }
//         }
//       }
//     }
//   })
//   .on("end", () => {
//     console.log(productsObj);
//     let csv = "name,Tassel Color 1,Tassel Color 2,Tassel Color 3";

//     Object.entries(productsObj).forEach(([key, values]) => {
//       const row = [
//         values.name,
//         values["Tassel Color 1"]?.join(";"),
//         values["Tassel Color 2"]?.join(";"),
//         values["Tassel Color 3"]?.join(";"),
//       ].join(",");

//       csv +="\n"+ row;
//     });

//     // Write CSV to a file
//     fs.writeFileSync("output1.csv", csv);

//     console.log("CSV data has been written to output.csv");
//   });
const fs = require("fs");
const csv = require("csv-parser");

const filePath = "magento_products.csv";
const outputFilePath = "Default.csv";

let push = true;
let count = 0;
let currentKey = null;
let optionKey = null;

let productCount = 0;

const productsObj = {};

fs.createReadStream(filePath)
  .pipe(csv())
  .on("data", (data) => {
    count++;

    if (
      data.name !== "" &&
      data.visibility == 4 &&
      data._attribute_set == "Default"
    ) {
      currentKey = data._custom_option_title.trim();

      if (!productsObj[currentKey]) {
        push = true;
        productCount++;
        productsObj[productCount] = {};
        productsObj[productCount]["name"] = data.name.replace(",", "-");
        let text = data.name;
        const colors = [
          'Antique Gold', 'Black', 'Brown', 'Emerald Green',
          'Gold', 'Green', 'Hunter Green', 'Light Blue',
          'Maroon', 'Navy Blue', 'Orange', 'Pink',
          'Purple', 'Red', 'Royal Blue', 'Silver', 'White'
        ];
        colors.forEach(color => {
          if (text.includes(color)) {
            productsObj[productCount]["color"] = color;
          }
        });
         
        productsObj[productCount]["desc"] = data.description
          .replace(/(\r\n|\n|\r)/gm, " ")
          .replace(/,/gm, ";")
          .replace(/<[^>]*>/g, "");
        productsObj[productCount][currentKey] = [data._custom_option_row_title];
      } else {
        push = false;
      }
    } else {
      if (data.name !== "") {
        push = false;
        return;
      }
      if (push) {
        if (
          data._custom_option_title !== null &&
          data._custom_option_type == "drop_down"
        ) {
          optionKey = data._custom_option_title.trim();
          productsObj[productCount][optionKey] = [data._custom_option_row_title];
        } else {
          const valueToAdd = data._custom_option_row_title.trim();

          if (valueToAdd.includes("Year")) {
            return;
          }

          if (!productsObj[productCount][currentKey]) {
            productsObj[productCount][currentKey] = [];
          }
          if (!productsObj[productCount][optionKey]) {
            productsObj[productCount][optionKey] = [];
          }

          if (!productsObj[productCount][currentKey].includes(valueToAdd)) {
            productsObj[productCount][currentKey].push(valueToAdd);
          }
          if (!productsObj[productCount][optionKey].includes(valueToAdd)) {
            productsObj[productCount][optionKey].push(valueToAdd);
          }
        }
      }
    }
  })
  .on("end", () => {
    console.log(productsObj);

    let csv = "name,color,description,Tassel Color 1,Tassel Color 2,Tassel Color 3";

    Object.entries(productsObj).forEach(([key, values]) => {
      const row = [
        values.name,
        values["color"],
        values["desc"],
        values["Tassel Color 1"]?.join(";"),
        values["Tassel Color 2"]?.join(";"),
        values["Tassel Color 3"]?.join(";"),
      ].join(",");

      csv += "\n" + row;
    });

    // Write CSV to a file
    fs.writeFileSync(outputFilePath, csv);

    console.log(`CSV data has been written to ${outputFilePath}`);
  });
