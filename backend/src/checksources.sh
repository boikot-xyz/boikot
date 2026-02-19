#!/usr/bin/env bash

while read p; do
  res=$(rustscrape "$p" | ../scrapecheck/infer.py 2>/dev/null)
  echo "\"$p\",$res"
done < sources.txt
