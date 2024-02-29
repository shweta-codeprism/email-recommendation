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
  res.redirect(
    "https://www.sephora.com/product/outrageous-effect-volume-lip-gloss-P417985?skuId=2234201&$deep_link=true",
    302
  );
});

app.get("/image", async (req, res) => {
  res.redirect(
    "https://d21vlv77sub7tq.cloudfront.net/item_images/u7PNVQx-prod-en-us-Products/standard/P97989778/2640241",
    302
  );
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
