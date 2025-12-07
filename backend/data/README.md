
## getting generic headlines

https://www.kaggle.com/datasets/felixludos/babel-briefings
unzip babel-briefings-v1-gb.json.zip
cat babel-briefings-v1-gb.json | jq '.[].title' > headlines.txt

