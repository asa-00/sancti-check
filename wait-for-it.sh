#!/usr/bin/env bash
# wait-for-it.sh

# Check if the correct number of arguments is provided
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 host:port command [args...]"
  exit 1
fi

# Extract host and port from the first argument
HOST=$(echo "$1" | cut -d ':' -f 1)
PORT=$(echo "$1" | cut -d ':' -f 2)
TIMEOUT=${TIMEOUT:-60} # Default timeout: 60 seconds
shift
CMD="$@"

# Validate host and port
if [ -z "$HOST" ] || [ -z "$PORT" ]; then
  echo "Error: Invalid host or port."
  exit 1
fi

start_time=$(date +%s)
while ! nc -z "$HOST" "$PORT"; do
  echo "Waiting for $HOST:$PORT..."
  sleep 1
  current_time=$(date +%s)
  elapsed_time=$((current_time - start_time))
  if [ "$elapsed_time" -ge "$TIMEOUT" ]; then
    echo "Timeout reached after $TIMEOUT seconds. Exiting."
    exit 1
  fi
done

echo "$HOST:$PORT is available, running command: $CMD"
exec $CMD