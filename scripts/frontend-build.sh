#!/bin/bash
set -e

if [ -f .env ]
then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

cd frontend
npm install
npm run build


sed -i s/__PROJECT_NAME__/$PROJECT_NAME/g build/index.html
sed -i s/__PROJECT_NAME__/$PROJECT_NAME/g build/manifest.json
