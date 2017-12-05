#!/usr/bin/env bash
# Download the protos directly from dgraph repository

protos=("api")

mkdir -p ./protos
rm ./protos/*

for proto in "${protos[@]}"
do
    curl -s "https://raw.githubusercontent.com/dgraph-io/dgraph/v0.9.4/protos/$proto.proto" \
        > "./protos/$proto.proto"
done
