#!/bin/bash
set -e

NAME=${COGNITO_NAME:-"Jerry"}
PASSWORD=${COGNITO_PASSWORD:-"asecretpassword"}
AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION:-"us-east-2"}

if [[ ! -v COGNITO_CLIENT_ID ]]; then
    echo "COGNITO_CLIENT_ID is not set"
    exit 1
fi

for USERNAME in "$@"
do
    aws cognito-idp sign-up \
    --username $USERNAME --password $PASSWORD --user-attributes Name="name",Value="$NAME" \
    --client-id $COGNITO_CLIENT_ID --region $AWS_DEFAULT_REGION

    echo "$USERNAME -> $PASSWORD"
done
