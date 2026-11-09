START_TIME=$(date +%s)
ROOT_DIR="$CODEBUILD_SRC_DIR"
FRONTEND_DIR="$ROOT_DIR/modules/frontend"
BACKEND_DIR="$ROOT_DIR/modules/backend"

echo "[COCREADORES][$ENV] Deploy started"

cd "$FRONTEND_DIR" || exit 1
npm install && npm run build
ERROR_CODE=$?
if [ $ERROR_CODE -gt 0 ]
then
    echo "[COCREADORES][$ENV] Deploy failed, FRONT build failed with error code: $ERROR_CODE"
    { exit 1; }
fi

cd "$BACKEND_DIR" || exit 1
mvn -DskipTests -P "${ENV,,}" package
ERROR_CODE=$?
if [ $ERROR_CODE -gt 0 ]
then
    echo "[COCREADORES][$ENV] Deploy failed, BACK build failed error code: $ERROR_CODE"
    { exit 1; }
fi

cd "$FRONTEND_DIR" || exit 1
aws s3 rm "s3://${S3_BUCKET_FRONT}/" --recursive
aws s3 cp out/ "s3://${S3_BUCKET_FRONT}/" --recursive
aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths "/*"

cd "$BACKEND_DIR" || exit 1
aws s3 rm "s3://${S3_BUCKET_BACK}/" --recursive
aws s3 cp ./target/backend-1.0.0.jar "s3://${S3_BUCKET_BACK}/app.jar"
aws ecs update-service --cluster "$ECS_CLUSTER_NAME" --service "$ECS_SERVICE_NAME" --force-new-deployment

END_TIME=$(date +%s)
ELAPSED_SECONDS=$((END_TIME - START_TIME))
ELAPSED_MINUTES_PART=$((ELAPSED_SECONDS / 60))
ELAPSED_SECONDS_PART=$((ELAPSED_SECONDS % 60))

echo "[COCREADORES][$ENV] Deploy finished in ${ELAPSED_MINUTES_PART}m${ELAPSED_SECONDS_PART}s"