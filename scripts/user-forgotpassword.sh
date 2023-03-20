#!/bin/bash
set -e

AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-"us-east-2"}

if [[ ! -v COGNITO_CLIENT_ID ]]; then
    echo "COGNITO_CLIENT_ID is not set"
    exit 1
fi

for USERNAME in "$@"
do
    aws cognito-idp forgot-password \
    --username $USERNAME \
    --client-id $COGNITO_CLIENT_ID --region $AWS_DEFAULT_REGION

    echo "$USERNAME"
done
