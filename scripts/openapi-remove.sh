#!/bin/bash
set -e

if [ -f .env ]
then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

SLS_STAGE=${SLS_STAGE:-"dev"}
STACK_NAME=$(echo "$PROJECT_NAME-$SLS_STAGE" | tr '[:upper:]' '[:lower:]')

OPENAPI_BUCKET=$(aws cloudformation --region $PROJECT_REGION describe-stack-resources --stack-name $STACK_NAME --query 'StackResources[?LogicalResourceId==`S3OpenAPI`].PhysicalResourceId' --output text 2> /dev/null || true)

aws s3 rm --recursive s3://$OPENAPI_BUCKET