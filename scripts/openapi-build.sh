#!/bin/bash
set -e

if [ -f .env ]
then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

SLS_STAGE=${SLS_STAGE:-"dev"}
STACK_NAME=$(echo "$PROJECT_NAME-$SLS_STAGE" | tr '[:upper:]' '[:lower:]')

API_ENDPOINT=$(aws cloudformation --region $PROJECT_REGION describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`HttpApiUrl`].OutputValue' --output text 2> /dev/null || true)

if [ -z "$API_ENDPOINT" ]
then
  echo "API_ENDPOINT is not found. Make sure you have deploy your backend"
  exit 1
fi

OPENAPI_DIST_JSON=openapi/build/openapi.json
./node_modules/.bin/yaml2json openapi/openapi.yaml > $OPENAPI_DIST_JSON
echo $(jq ".servers[].url=\"$API_ENDPOINT\"" $OPENAPI_DIST_JSON) > $OPENAPI_DIST_JSON
echo $(jq ".info.title=\"$PROJECT_NAME\"" $OPENAPI_DIST_JSON) > $OPENAPI_DIST_JSON

echo "OPENAPI_DIST_JSON -> $OPENAPI_DIST_JSON"

OPENAPI_DIST_HTML=openapi/build/index.html
sed s/__PROJECT_NAME__/$PROJECT_NAME/ openapi/index.html > $OPENAPI_DIST_HTML

echo "OPENAPI_DIST_HTML -> $OPENAPI_DIST_HTML"