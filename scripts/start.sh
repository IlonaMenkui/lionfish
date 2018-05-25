#!/bin/bash

PORT=8080

POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -t|--token)
    TOKEN="$2"
    shift # past argument
    shift # past value
    ;;
    -p|--port)
    PORT="$2"
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

if [ -z "$TOKEN" ]; then
    echo "Please, provide valid token"
    exit 1
fi

SSH_TUNNEL_COMMAND="ngrok http $LF_SERVER_PORT"
OPERATION_TIMEOUT=3

if [ `jobs | grep "$SSH_TUNNEL_COMMAND" | wc -l` -eq 0 ]; then
    "${SSH_TUNNEL_COMMAND}" &>/dev/null;
fi

URL=`timeout -k 3 $OPERATION_TIMEOUT curl --silent --show-error http://127.0.0.1:4040/api/tunnels | grep -Eoh "http://.*?ngrok.io"`

yarn # install dependencies 
LF_APP_BOT_TOKEN=$TOKEN LF_SERVER_PORT=$PORT LF_LB_URL=$URL yarn start
