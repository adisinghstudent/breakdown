#!/bin/bash
# Setup Redpanda topics for the Undergoing Project agent

echo "Waiting for Redpanda to be ready..."
sleep 5

echo "Creating topics..."
docker compose -f backend/docker/docker-compose.yml exec -T rpk rpk topic create issues builds vendors actions outcomes dlq --brokers=redpanda:9092

echo "Listing topics..."
docker compose -f backend/docker/docker-compose.yml exec -T rpk rpk topic list --brokers=redpanda:9092

echo "Topics created successfully!"
