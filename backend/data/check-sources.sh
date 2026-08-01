#!/usr/bin/env bash

ls ethics-pages | xargs -I{} bash -c "echo -n \"{},\"; cat ethics-pages/{} | ../../../scrapecheck/infer.py 2>/dev/null"
