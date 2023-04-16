#!/bin/bash
set -e

if [ -f .env ]
then
    while read env; do
        if [[ $env == PROJECT_* ]];
        then
            echo $env
        fi
    done < .env
fi
