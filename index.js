const express = require("express");
const puppeteer = require("puppeteer");
const sharp = require("sharp");

const app = express();
const port = process.env.PORT || 3030;

app.get("/", (req, res) => {
  res.end("It is working");
});
app.get("/url", async (req, res) => {
  const { slot } = req.query;

  if (slot == 1) {
    res.redirect("https://constructor.io/");
  } else {
    res.redirect("https://docs.constructor.io/");
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
      "https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg"
    );
  } else {
    html = html.replace(
      "replace-image",
      "https://1.bp.blogspot.com/-kK7Fxm7U9o0/YN0bSIwSLvI/AAAAAAAACFk/aF4EI7XU_ashruTzTIpifBfNzb4thUivACLcBGAsYHQ/s16000/222.jpg"
    );
  }

  console.log("url", html);

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the viewport size
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the HTML content
    await page.setContent(html);

    // Take a screenshot of the page
    const screenshot = await page.screenshot({ type: "png" });
    const outputImagePath = "compressed_image.jpg";
    // Compression options
    const compressionOptions = {
      quality: 80, // Adjust the quality value (0-100) to change compression level
      chromaSubsampling: "4:4:4" // Adjust chroma subsampling for JPEG format (optional)
    };

    // Compress the image
    sharp(screenshot)
      .jpeg(compressionOptions)
      .toFile(outputImagePath)
      .then(() => {
        console.log("Image compressed successfully!");
      })
      .catch(error => {
        console.error("Error compressing image:", error);
      });

    // Set the response headers
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", "attachment; filename=screenshot.jpg");

    // Send the image data
    res.send(outputImagePath);

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
