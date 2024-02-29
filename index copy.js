const express = require("express");
const puppeteer = require("puppeteer");
const sharp = require("sharp");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

require("dotenv").config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

const app = express();
const port = process.env.PORT || 3030;

app.get("/", (req, res) => {
  res.end("It is working");
});

app.get("/url", async (req, res) => {
  const { slot } = req.query;

  // 1. https://www.sephora.com/product/outrageous-effect-volume-lip-gloss-P417985?skuId=2234201
  // 2. https://www.sephora.com/product/sephora-colorful-blush-P433005?skuId=2496065&icid2=products%20grid:p433005:product
  // 3. https://www.sephora.com/product/sephora-collection-extreme-lip-plumper-P479855?skuId=2462877&icid2=products%20grid:p479855:product
  // 4. https://www.sephora.com/product/outrageous-intense-lip-plumper-set-P508509?skuId=2682227&icid2=products%20grid:p508509:product
  // 5. https://www.sephora.com/product/sephora-collection-glossed-lip-gloss-P457430?skuId=2256105&icid2=products%20grid:p457430:product
  // 6. https://www.sephora.com/product/rouge-gel-lip-liner-P401715?skuId=1691278&icid2=products%20grid:p401715:product
  // 7. https://www.sephora.com/product/lip-liner-to-go-P395532?skuId=1723691&icid2=products%20grid:p395532:product
  // 8. https://www.sephora.com/product/colorful-gloss-balm-P403322?skuId=2540979&icid2=products%20grid:p403322:product
  // 9. https://www.sephora.com/product/juicy-glass-lip-oil-P508041?skuId=2709186&icid2=products%20grid:p508041:product
  // 10. https://www.sephora.com/product/P281411

  if (slot == 1) {
    res.redirect(
      "https://www.myntra.com/kurtas/herenow/herenow-striped-sequined-detail-a-line-kurta/22689590/buy"
    );
  } else if (slot == 2) {
    res.redirect(
      "https://www.myntra.com/kurtas/herenow/herenow-pure-cotton-floral-print-gotta-patti-kurta/23144290/buy"
    );
  } else if (slot == 3) {
    res.redirect(
      "https://www.myntra.com/kurtas/anouk/anouk-women-pink-printed-straight-kurta/2322979/buy"
    );
  } else if (slot == 4) {
    res.redirect(
      "https://www.myntra.com/kurtas/herenow/herenow-women-off-white--pink-ethnic-motifs-print-pure-cotton-straight-kurta/13166544/buy"
    );
  }
});

app.get("/image", async (req, res) => {
  const { slot, style } = req.query;

  const styleSheet =
    style === "1"
      ? "styles1.css"
      : style === "2"
      ? "styles2.css"
      : "styles3.css";

  let html = `
  <!DOCTYPE html>
  <html>
  <head>
    <link rel="stylesheet" href="https://emailrecsdemo.s3.amazonaws.com/styles3.css">
  </head>
  <body>
  <div class="card" style="display: flex; flex-direction: column; align-items: flex-start; word-break: normal;">
      <img
        alt="Placeholder product name"
        class="image"
        src="replace-image"
        width="100%"
      />
      <span class="tag"> replace-tag </span>
      <span class="brand"> replace-brand-name </span>
      <p class="details">
        <span class="name">replace-product-name</span>
        <span class="original-price">replace-original-price</span>
        <span class="sale-price">replace-sales-price</span>
      </p>
   </div>
   <body/>
   <html>`;

  // let html = `
  // <!DOCTYPE html>
  // <html>
  // <body>
  // <div class="card" style="display: flex; flex-direction: column; align-items: flex-start; word-break: normal;">
  //     <img
  //       alt="Placeholder product name"
  //       class="image"
  //       src="replace-image"
  //       width="100%"
  //     />
  //     <span class="tag"> replace-tag </span>
  //     <span class="brand"> replace-brand-name </span>
  //     <span class="name"> replace-product-name </span>
  //  </div>
  //  <body/>
  //  <html>`;

  // fetch the items here

  const tag =
    slot == 1
      ? "Only at Sephora"
      : slot == 3
      ? "New - Limited Edition"
      : slot == 6
      ? "New - Only at Sephora"
      : slot == 9
      ? "New - Limited Edition"
      : "";

  const brand =
    slot == 1
      ? "SEPHORA COLLECTION"
      : slot == 2
      ? "Tower 28 Beauty"
      : slot == 3
      ? "Peter Thomas Roth"
      : slot == 4
      ? "Lancôme"
      : slot == 5
      ? "Murad"
      : slot == 6
      ? "Murad"
      : slot == 7
      ? "Peter Thomas Roth"
      : slot == 8
      ? "CLINIQUE"
      : slot == 9
      ? "CLINIQUE"
      : "CLINIQUE";

  const name =
    slot == 1
      ? "Outrageous Plumping Lip Gloss"
      : slot == 2
      ? "Sephora Colorful® Blush"
      : slot == 3
      ? "Outrageous Plump Intense Hydrating Lip Gloss"
      : slot == 4
      ? "Outrageous Intense Lip Plumper Set"
      : slot == 5
      ? "Glossed Lip Gloss"
      : slot == 6
      ? "Retractable Rouge Gel Lip Liner"
      : slot == 7
      ? "Lip Liner To Go"
      : slot == 8
      ? "Sephora Colorful® Lip Gloss Balm"
      : slot == 9
      ? "Juicy Glass Lip Oil"
      : "Cream Lip Stain Liquid Lipstick";

  const price =
    slot == 1
      ? "$13.00"
      : slot == 2
      ? "$14.00"
      : slot == 3
      ? "$13.00"
      : slot == 4
      ? "$16.00"
      : slot == 5
      ? "$12.00"
      : slot == 6
      ? "$13.00"
      : slot == 7
      ? "$6.00"
      : slot == 8
      ? "$10.00"
      : slot == 9
      ? "$18.00"
      : "$15.00";

  const salesPrice =
    slot == 1
      ? "$12.00"
      : slot == 2
      ? "$12.00"
      : slot == 3
      ? "$10.00"
      : slot == 4
      ? "$15.50"
      : slot == 5
      ? "$11.50"
      : slot == 6
      ? "$10.00"
      : slot == 7
      ? "$3.00"
      : slot == 8
      ? "$8.00"
      : slot == 9
      ? "$15.00"
      : "$12.00";

  const image =
    slot == 1
      ? "https://emailrecsdemo.s3.amazonaws.com/image-1.avif"
      : slot == 2
      ? "https://emailrecsdemo.s3.amazonaws.com/image-2.jpeg"
      : slot == 3
      ? "https://emailrecsdemo.s3.amazonaws.com/image-3.jpeg"
      : slot == 4
      ? "https://emailrecsdemo.s3.amazonaws.com/image-4.jpeg"
      : slot == 5
      ? "https://emailrecsdemo.s3.amazonaws.com/image-5.jpeg"
      : slot == 6
      ? "https://emailrecsdemo.s3.amazonaws.com/image-6.jpeg"
      : slot == 7
      ? "https://emailrecsdemo.s3.amazonaws.com/image-7.jpeg"
      : slot == 8
      ? "https://emailrecsdemo.s3.amazonaws.com/image-8.jpeg"
      : slot == 9
      ? "https://emailrecsdemo.s3.amazonaws.com/image-9.jpeg"
      : "https://emailrecsdemo.s3.amazonaws.com/image-10.jpeg";

  html = html.replace("replace-image", image);
  html = html.replace("replace-brand-name", brand);
  html = html.replace("replace-product-name", name);
  html = html.replace("replace-original-price", price);
  html = html.replace("replace-sales-price", salesPrice);
  html = html.replace("replace-tag", tag);

  // const browser = await puppeteer.launch({
  //   args: [
  //     "--disable-setuid-sandbox",
  //     "--no-sandbox",
  //     "--single-process",
  //     "--no-zygote"
  //   ],
  //   executablePath:
  //     process.env.NODE_ENV === "production"
  //       ? process.env.PUPPETEER_EXECUTABLE_PATH
  //       : puppeteer.executablePath()
  // });

  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    // Set the viewport size
    await page.setViewport({ width: 335, height: 100, deviceScaleFactor: 1 });

    // page.addStyleTag({ path: styleSheet });
    // Navigate to the HTML content
    await page.setContent(html);
    // Take a screenshot of the page
    const content = await page.$("body");
    const screenshot = await content.screenshot({
      // omitBackground: true,
      optimizeForSpeed: true,
      // fromSurface: false,
      type: "webp"
    });
    // const outputImagePath = "compressed_image.jpeg";
    // Compression options
    // const compressionOptions = {
    //   quality: 60, // Adjust the quality value (0-100) to change compression level
    //   chromaSubsampling: "4:4:4" // Adjust chroma subsampling for JPEG format (optional)
    // };
    // // Compress the image
    // const outputImage = sharp(screenshot)
    //   .toFormat("jpeg", { mozjpeg: true, ...compressionOptions })
    //   .toBuffer();

    console.log(bucketName);

    const uploadParams = {
      Bucket: bucketName,
      Body: screenshot,
      Key: `Product-${slot}-${style}.webp`,
      ContentType: "image/webp"
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // res.setHeader("Content-Type", "image/jpeg");
    // res.setHeader(
    //   "Content-Disposition",
    //   "attachment; filename=product_image.jpeg"
    // );
    // res.send(screenshot);
    // // Close the browser
    await page.close();
    await browser.close();

    // res.redirect("https://emailrecsdemo.s3.amazonaws.com/Sephora+demo.png");

    res.end();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
