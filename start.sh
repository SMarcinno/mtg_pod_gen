#!/usr/bin/env bash

# Name: run_mtg.sh
# Description: Stops any running 'mtg-server' container, builds the 'mtg' image, 
#              and runs a new container named 'mtg-server' in detached mode with --rm.

set -e

CONTAINER_NAME="mtg-server"
IMAGE_NAME="mtg"

# 1. Stop the container if it's running
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Stopping existing container '${CONTAINER_NAME}'..."
  docker stop "${CONTAINER_NAME}"
else
  echo "No running '${CONTAINER_NAME}' container found."
fi

# 2. Build the Docker image
echo "Building image '${IMAGE_NAME}'..."
docker build -t "${IMAGE_NAME}" .

# 3. Run the container in detached mode with --rm
echo "Starting new container '${CONTAINER_NAME}' (detached)..."
docker run --rm -d --name "${CONTAINER_NAME}" -p 80:80 "${IMAGE_NAME}"

echo "Done. '${CONTAINER_NAME}' is now running and mapped to port 80."
