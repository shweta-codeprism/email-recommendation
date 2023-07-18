const express = require("express");
const puppeteer = require("puppeteer");
const sharp = require("sharp");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3030;

app.get("/", (req, res) => {
  res.end("It is working");
});

app.get("/url", async (req, res) => {
  const { slot } = req.query;

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
  let html = `<div
    style="
     width: 100%;
     height: 100%;
     background: red;
     display: flex;
     color: white;"
    >
      <img src="replace-image" alt="ALT" style="width: 100%; height: 100%; object-fit: cover;"/>
   </div>`;

  const { slot } = req.query;

  // fetch the items here

  if (slot == 1) {
    html = html.replace(
      "replace-image",
      "https://drive.google.com/uc?export=view&id=1l0oU2aooqhOHYuA4h0eQrtadlzuTlI_p"
    );
  } else if (slot == 2) {
    html = html.replace(
      "replace-image",
      "https://drive.google.com/uc?export=view&id=1JN8tUPY1ta3QRm0y5bhugt4niqS3eBxE"
    );
  } else if (slot == 3) {
    html = html.replace(
      "replace-image",
      "https://drive.google.com/uc?export=view&id=1lMyVwAWBrddMhrlY_wbzwv8yfU8Lcs-q"
    );
  } else if (slot == 4) {
    html = html.replace(
      "replace-image",
      "https://drive.google.com/uc?export=view&id=1NQKCiEqFH1AUuK7hZeP08J3EuRwIFz12"
    );
  }

  console.log("url", html);

  const browser = await puppeteer.launch({
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote"
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath()
  });

  try {
    const page = await browser.newPage();

    // Set the viewport size
    await page.setViewport({ width: 424, height: 732, deviceScaleFactor: 1 });

    // Navigate to the HTML content
    await page.setContent(html);

    // Take a screenshot of the page
    const screenshot = await page.screenshot({ type: "jpeg" });
    // const outputImagePath = "compressed_image.jpeg";
    // Compression options
    // const compressionOptions = {
    //   quality: 60 // Adjust the quality value (0-100) to change compression level
    //   // chromaSubsampling: "4:4:4" // Adjust chroma subsampling for JPEG format (optional)
    // };

    // Compress the image
    // sharp(screenshot)
    //   .toFormat("jpeg", { mozjpeg: true, ...compressionOptions })
    //   .toFile(outputImagePath)
    //   .then(value => {
    //     console.log("Image compressed successfully!", value);
    //     // Set the response headers
    //     res.setHeader("Content-Type", "image/jpeg");
    //     res.setHeader(
    //       "Content-Disposition",
    //       "attachment; filename=compressed_image.jpeg"
    //     );

    //     // Send the image data
    //     res.sendFile(__dirname + "/" + outputImagePath);
    //   })
    //   .catch(error => {
    //     console.error("Error compressing image:", error);
    //     res.status(500).send("Error in optimizing image");
    // });

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=product_image.jpeg"
    );

    res.send(screenshot);

    // Close the browser
    await browser.close();
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred");
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
