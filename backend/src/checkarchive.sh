#!/usr/bin/env bash


while IFS= read -r p; do
    curl "https://archive.org/wayback/available?url=$(echo -e "${p}" | tr -d '[:space:]')"
    echo
done < badsources.txt
