#!/bin/bash
set -e

if [ -f .env ]
then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

node configs/frontend.js

SLS_STAGE=${SLS_STAGE:-"dev"}
STACK_NAME=$(echo "$PROJECT_NAME-$SLS_STAGE" | tr '[:upper:]' '[:lower:]')

API_ENDPOINT=$(aws cloudformation --region $PROJECT_REGION describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`HttpApiUrl`].OutputValue' --output text 2> /dev/null || true)

if [ -z "$API_ENDPOINT" ]
then
  echo "API_ENDPOINT is not found. Make sure you have deploy your backend"
  exit 1
fi

FRONTEND_CONFIG_JSON=frontend/src/configs.json
echo $(jq ".frontend.api.endpoint=\"$API_ENDPOINT\"" $FRONTEND_CONFIG_JSON) > $FRONTEND_CONFIG_JSON
