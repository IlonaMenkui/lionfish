#!/bin/bash

export LF_SERVER_PORT=8080

NGROK_COMMAND="ngrok http $LF_SERVER_PORT"

if [ `jobs | grep "$NGROK_COMMAND" | wc -l` -eq 0 ]; then
    $NGROK_COMMAND &
fi

export LF_LB_URL=`curl --silent --show-error --max-time 3 http://127.0.0.1:4040/api/tunnels | grep -Eoh "http://.*?ngrok.io"`

yarn start 
