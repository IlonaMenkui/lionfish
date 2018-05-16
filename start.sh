#!/bin/bash

LF_SERVER_PORT=8080

while [[ $# -ge 1 ]]
do
key="$1"
case "$1" in
    -p|--port) LF_SERVER_PORT=$2;;
    -t|--token) LF_APP_BOT_TOKEN=$2;;
    *)
    printf "\nUnknown command!\n\n"
    exit 1
    ;;
esac
shift # past argument or value
done

SSH_TUNNEL_COMMAND="ngrok http $LF_SERVER_PORT"
OPERATION_TIMEOUT=3

if [ `jobs | grep "$SSH_TUNNEL_COMMAND" | wc -l` -eq 0 ]; then
    "${SSH_TUNNEL_COMMAND}" &>/dev/null;
fi

export LF_SERVER_PORT
export LF_LB_URL=`timeout -k 3 $OPERATION_TIMEOUT curl --silent --show-error http://127.0.0.1:4040/api/tunnels | grep -Eoh "http://.*?ngrok.io"`

yarn && yarn start
