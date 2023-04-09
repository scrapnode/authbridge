#!/bin/bash
set -e

if [ -f .env ]
then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

SLS_STAGE=${SLS_STAGE:-"dev"}
STACK_NAME=$(echo "$PROJECT_NAME-$SLS_STAGE" | tr '[:upper:]' '[:lower:]')

API_ENDPOINT=$(aws cloudformation --region $PROJECT_REGION describe-stacks --stack-name $STACK_NAME --query 'Stacks[0].Outputs[?OutputKey==`HttpApiUrl`].OutputValue' --output text 2> /dev/null || true)

OPENAPI_DIST=openapi/dist/openapi.json
./node_modules/.bin/yaml2json openapi/openapi.yaml > $OPENAPI_DIST
echo $(jq ".servers[].url=\"$API_ENDPOINT\"" $OPENAPI_DIST) > $OPENAPI_DIST
echo $(jq ".info.title=\"$PROJECT_NAME\"" $OPENAPI_DIST) > $OPENAPI_DIST

sed s/__PROJECT_NAME__/$PROJECT_NAME/ openapi/index.html > openapi/dist/index.html