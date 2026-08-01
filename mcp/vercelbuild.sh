#!/usr/bin/env bash

set -x

mkdir public
echo "boikot MCP server served from /api/mcp" > public/index.html

if [ -f ../boikot.json ]; then
    cp ../boikot.json .
else
    curl "https://raw.githubusercontent.com/boikot-xyz/boikot/refs/heads/main/boikot.json" > boikot.json
fi

