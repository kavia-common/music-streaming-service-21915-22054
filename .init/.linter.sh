#!/bin/bash
cd /home/kavia/workspace/code-generation/music-streaming-service-21915-22054/WebFrontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

