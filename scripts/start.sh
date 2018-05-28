#!/bin/bash

SSH_TUNNEL_PREFIX=lionfish
SSH_TUNNEL_HOST=serveo.net
SSH_TUNNEL_SOCKET=.lionfish-socket

URL="${SSH_TUNNEL_PREFIX}.${SSH_TUNNEL_HOST}"
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

if [ -S $SSH_TUNNEL_SOCKET ]; then
    echo "Releasing old tunnels..."
    ssh -S $SSH_TUNNEL_SOCKET -O exit $SSH_TUNNEL_HOST
    rm -f $SSH_TUNNEL_SOCKET
fi

ssh -f -N -M -T -S $SSH_TUNNEL_SOCKET -R $SSH_TUNNEL_PREFIX:443:localhost:$PORT $SSH_TUNNEL_HOST

yarn # install dependencies 
LF_APP_BOT_TOKEN=$TOKEN LF_SERVER_PORT=$PORT LF_LB_URL=$URL yarn start
