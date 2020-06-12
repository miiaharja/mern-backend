const aws = require("aws-sdk");
const fs = require("fs");
const HttpError = require("../models/http-error");

const awsSignup = (req, res, next) => {
  aws.config.setPromisesDependency();
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });
  const s3 = new aws.S3();
  var params = {
    ACL: "public-read",
    Bucket: process.env.S3_BUCKET_NAME,
    Body: fs.createReadStream(req.file.path),
    Key: `images/${req.file.filename}`,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.log("Error occured while trying to upload to S3 bucket", err);
      return next(
        new HttpError("Error occured while trying to upload image", 500)
      );
    }

    if (data) {
      console.log(req.file.path);
      fs.unlinkSync(req.file.path); // Empty temp folder
      req.file.path = data.Location;
      next();
    }
  });
};

module.exports = awsSignup;
