const fs = require("fs");
const csv = require("csv-parser");

const filePath = "magento_products.csv";
const uniqueNames = new Map();
const outputFilePath = "capsonly.csv";

push = true;
count = 0;

productCount = 0;

const productsObj = {};
fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
        if (
            data.name != "" &&
            data.visibility == 4 &&
            data._attribute_set == "cap only"
        ) {
            push = true;
            productCount++;
            productsObj[productCount] = {};
            productsObj[productCount]["name"] = data.name;
            // productsObj[productCount]["heightxsize"] = [];
            // productsObj[productCount]["size"] = [];
            productsObj[productCount]["price"] = data.price;
            productsObj[productCount]["handle"] = data.url_key;
            productsObj[productCount]["description"] = data.short_description.replace(/(\r\n|\n|\r)/gm, ' ').replace(/,/g, ';');
            productsObj[productCount]["meta_desc"] = data.meta_description.replace(/(\r\n|\n|\r)/gm, ' ').replace(/,/g, ';');
            productsObj[productCount]["meta_title"] = data.meta_title
                .replace(/(\r\n|\n|\r)/gm, " ")
                .replace(/,/g, ";");
            productsObj[productCount]["images"] = [];
            if (data._media_image != "") {
                productsObj[productCount]["images"].push(data._media_image);
                // if (data._super_attribute_code == "heightxsize") {
                //     productsObj[productCount]["heightxsize"].push(
                //         data._super_attribute_option
                //     );
                // }
                // if (data._super_attribute_code == "size") {
                //     productsObj[productCount]["size"].push(data._super_attribute_option);
                // }
            } else {
                productsObj[productCount]["images"].push(
                    data.image
                );
            }

        } else {
            count++;
            if (push && data._super_attribute_code == "heightxsize") {
                // console.log(count)
                if (data.name !== "") {
                    push = false;
                    return;
                }
                productsObj[productCount]["heightxsize"].push(
                    data._super_attribute_option
                );
            }
            if (push && data._super_attribute_code == "size") {
                // console.log(count)
                if (data.name !== "") {
                    push = false;
                    return;
                }
                productsObj[productCount]["size"].push(data._super_attribute_option);
            }
            if (
                push &&
                data._media_image != ""
            ) {
                if (data.name != '') { push = false; return; }

                productsObj[productCount]["images"].push(
                    data._media_image
                );
            }
        }
    })
    .on("end", () => {
        // console.log(JSON.stringify(productsObj, null, 2));
        // console.log(productsObj);

        const productss = [];

        for (const key in productsObj) {
            if (productsObj.hasOwnProperty(key)) {
                // console.log(productsObj)

                const productObj = productsObj[key];
                const imagesValues = productObj.images;
                // console.log(imagesValues)
                console.log(productObj)
                if (imagesValues.length > 1) {
                    productss.push({
                        name: productObj.name,
                        image: "https://cdn.shopify.com/s/files/1/0780/4793/6800/files" + imagesValues[0],
                        price: productObj.price,
                        handle: productObj.handle,
                        description: productObj.description,
                        meta_desc: productObj.meta_desc,
                        meta_title: productObj.meta_title,
                        vendor: "graduationworld",
                        tag: "tassel, caps_with_tassel",
                        product_category: "Apparel & Accessories > Clothing",
                        type: "Default",
                        published: "TRUE",
                        varaint_sku: productObj.handle,
                        image_position: 1,
                        giftcard: "FALSE",
                        status: "active"

                    });
                    slicedImagesValues = imagesValues.slice(1, imagesValues.length);
                    slicedImagesValues.forEach((imageValue, index) =>
                        productss.push({
                            name: "",
                            image: "https://cdn.shopify.com/s/files/1/0780/4793/6800/files" + imageValue,
                            handle:"",
                            price:"",
                            description: "",
                            meta_desc: "",
                            meta_title: "",
                            vendor: "",
                            tag: "",
                            product_category: "",
                            type: "",
                            published: "",
                            image_position: "",
                            giftcard: "",
                            status: ""
                        })
                    );
                } else {
                    productss.push({
                        name: productObj.name,
                        image: "https://cdn.shopify.com/s/files/1/0780/4793/6800/files" + imagesValues[0],
                        price: productObj.price,
                        handle: productObj.handle,
                        description: productObj.description,
                        meta_desc: productObj.meta_desc,
                        meta_title: productObj.meta_title,
                        vendor: "graduationworld",
                        tag: "tassel, caps_with_tassel",
                        product_category: "Apparel & Accessories > Clothing",
                        type: "Default",
                        published: "TRUE",
                        varaint_sku: productObj.handle,
                        image_position: 1,
                        giftcard: "FALSE",
                        status: "active"
                    });
                }
            }
        }


        // Process the parsed CSV data
        const uniqueNamesArray = Array.from(productss);

        // Convert data to CSV format
        const csvContent = Object.entries(productss)
            .map(
                ([id, { name, image, price, handle, description, meta_desc, meta_title, vendor, tag, product_category, type,
                    published, image_position, giftcard, status }]) =>
                    `${handle},"${name}", ${image}, ${price}, ${description},${meta_desc}, ${meta_title}, ${vendor}, ${tag}, ${product_category}, ${type}, ${published},${image_position}, ${giftcard}, ${status} `
            )
            .join("\n");

        // Write to the CSV file
        fs.writeFile(outputFilePath, csvContent, (err) => {
            if (err) {
                console.error("Error writing to CSV file:", err);
            } else {
                console.log(`CSV file '${outputFilePath}' created successfully.`);
            }
        });
    });
