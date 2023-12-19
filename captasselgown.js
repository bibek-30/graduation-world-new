const fs = require("fs");
const csv = require("csv-parser");

const filePath = "magento_products.csv";
const uniqueNames = new Map();
const outputFilePath = "captasselgown.csv";

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
            data._attribute_set == "Cap, Gown & Tassel Sets"
        ) {
            push = true;
            productCount++;
            productsObj[productCount] = {};
            productsObj[productCount]["name"] = data.name;
            productsObj[productCount]["heightxsize"] = [];
            productsObj[productCount]["size"] = [];
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
                if (data._super_attribute_code == "heightxsize") {
                    productsObj[productCount]["heightxsize"].push(
                        data._super_attribute_option
                    );
                }
                if (data._super_attribute_code == "size") {
                    productsObj[productCount]["size"].push(data._super_attribute_option);
                }
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
                const heightxsizeValues = productObj.heightxsize;
                const sizeValues = productObj.size;
                const imagesValues = productObj.images;


                if (sizeValues.length > 0) {
                    productss.push({
                        name: productObj.name,
                        heightxsize: heightxsizeValues[0],
                        size: sizeValues[0],
                        image: "https://cdn.shopify.com/s/files/1/0780/4793/6800/files/" + imagesValues[0].split("/").pop(),
                        price: productObj.price,
                        handle: productObj.handle,
                        description: productObj.description,
                        meta_desc: productObj.meta_desc,
                        meta_title: productObj.meta_title,
                        vendor: "graduationworld",
                        tag: "tassel",
                        product_category: "Apparel & Accessories > Clothing",
                        type: "default",
                        published: "true",
                        option1: "HeightxSize",
                        option2: "Size",
                        varaint_sku: productObj.handle + "-" + heightxsizeValues[0] + "-" + sizeValues[0],
                        image_position: 1,
                        giftcard: "false",
                        status: "active"

                    });

                    slicedheightxsizeValues = heightxsizeValues.slice(
                        1,
                        heightxsizeValues.length
                    );
                    slicedSizeValues = sizeValues.slice(1, sizeValues.length);
                    slicedImagesValues = imagesValues.slice(1, imagesValues.length);
                    slicedheightxsizeValues.forEach((heightXsize, index) =>
                        productss.push({
                            name: "",
                            heightxsize: slicedheightxsizeValues[index],
                            size: slicedSizeValues[index],
                            image: "https://cdn.shopify.com/s/files/1/0780/4793/6800/files/" + imagesValues[index+1]?.split("/").pop(),
                            handle: "",
                            price: productObj.price,
                            description: "",
                            varaint_sku: productObj.handle + "-" + slicedheightxsizeValues[index] + "-" + slicedSizeValues[index],
                            meta_desc: "",
                            meta_title: "",
                            vendor: "",
                            tag: "",
                            product_category: "",
                            type: "",
                            published: "",
                            option1: "",
                            option2: "",
                            image_position: "",
                            giftcard: "",
                            status: ""
                        })
                    );
                } else {
                    productss.push({
                        name: productObj.name,
                        heightxsize: "",
                        size: "",
                        image: "https://cdn.shopify.com/s/files/1/0780/4793/6800/files/" + slicedImagesValues[0].split("/").pop(),
                        price: productObj.price,
                        handle: productObj.handle,
                        description: productObj.description,
                        meta_desc: productObj.meta_desc,
                        meta_title: productObj.meta_title,
                        vendor: "graduationworld",
                        tag: "tassel",
                        product_category: "Apparel & Accessories > Clothing",
                        type: "default",
                        published: "true",
                        option1: "HeightxSize",
                        option2: "Size",
                        varaint_sku: "",
                        image_position: 1,
                        giftcard: "false",
                        status: "active"
                    });
                }
            }
        }

        //   console.log(productss)

        // Process the parsed CSV data
        const uniqueNamesArray = Array.from(productss);

        // Convert data to CSV format
        const csvContent = Object.entries(productss)
            .map(
                ([id, { name, heightxsize, size, image, price, handle, description, meta_desc, meta_title, vendor, tag, product_category, type,
                    published, option1, option2, image_position, varaint_sku, giftcard, status }]) =>
                    `${handle},"${name}", ${heightxsize}, ${size}, ${image}, ${price}, ${description}, ${meta_desc}, ${meta_title}, ${vendor}, ${tag}, ${product_category}, ${type}, ${published}, ${option1}, ${option2}, ${image_position}, ${varaint_sku}, ${giftcard}, ${status} `
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
