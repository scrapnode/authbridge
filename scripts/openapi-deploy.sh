#!/bin/bash
set -e

if [ -f .env ]
then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

OPENAPI_DEPLOY=${OPENAPI:-"true"}
if [ $OPENAPI_DEPLOY != "true" ]; then
  echo "OPENAPI -> ignore"
  exit 0
fi


SLS_STAGE=${SLS_STAGE:-"dev"}
STACK_NAME=$(echo "$PROJECT_NAME-$SLS_STAGE" | tr '[:upper:]' '[:lower:]')

OPENAPI_BUCKET=$(aws cloudformation --region $PROJECT_REGION describe-stack-resources --stack-name $STACK_NAME --query 'StackResources[?LogicalResourceId==`S3OpenAPI`].PhysicalResourceId' --output text 2> /dev/null || true)

if [ -z "$OPENAPI_BUCKET" ]
then
  echo "OPENAPI_BUCKET is not found. Make sure you have deploy your resources"
  exit 1
fi

aws s3 sync openapi/build s3://$OPENAPI_BUCKET --delete --exclude "*" --include "*.html" --include "*.json"

echo "S3_OPENAPI_ENDPOINT -> http://$OPENAPI_BUCKET.s3-website.$PROJECT_REGION.amazonaws.com"