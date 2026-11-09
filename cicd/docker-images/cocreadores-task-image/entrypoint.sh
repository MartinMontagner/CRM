#!/bin/bash

aws s3 cp "s3://$S3_BUCKET_BACK" . --recursive
exec java -jar app.jar