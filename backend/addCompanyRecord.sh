#!/usr/bin/env bash

# read a company json entry from your clipboard and add it to boikot.json

sed -i "" '$ d' boikot.json
sed -i "" '$ d' boikot.json
sed -i "" '$ s/$/,/' boikot.json

pbpaste >> boikot.json

sed -i "" '$ s/.$//' boikot.json
echo "}}" >> boikot.json

cat boikot.json | jq --indent 4 > boikot.json.ok
mv boikot.json.ok boikot.json
