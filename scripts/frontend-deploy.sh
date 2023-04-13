#!/bin/bash
set -e

if [ -f .env ]
then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

SLS_STAGE=${SLS_STAGE:-"dev"}
STACK_NAME=$(echo "$PROJECT_NAME-$SLS_STAGE" | tr '[:upper:]' '[:lower:]')

FRONTEND_BUCKET=$(aws cloudformation --region $PROJECT_REGION describe-stack-resources --stack-name $STACK_NAME --query 'StackResources[?LogicalResourceId==`S3Frontend`].PhysicalResourceId' --output text 2> /dev/null || true)

aws s3 sync frontend/build s3://$FRONTEND_BUCKET --delete

echo "S3_FRONTEND_ENDPOINT -> http://$FRONTEND_BUCKET.s3-website.$PROJECT_REGION.amazonaws.com"