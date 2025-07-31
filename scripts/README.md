# scripts

these are some information gathering scripts that can be used to collect company ethics data. There are also some other utility scripts for other purposes

- `search.js` - exports functions that can be used to search the web
- `wiki.js` - exports functions that can be used to get information from a company's wikipedia page
- `getRecord.js` - exports functions that can be used to get a company's entry in the `boikot.json` dataset
- `addRecord.js` - exports functions that can be used to add a company entry to the `boikot.json` dataset
- `llm.js` - exports functions that can be used to get responses from LLMs, locally using ollama or via api eg. groq
- `prompts.js - exports functions that generate llm prompts. [in progress]
- `brander.js` - adds entries to the `boikot.json` dataset for brands or subsidiaries of a parent company [in progress]
- `assemble.js` - gathers informarion on a company and adds am entry to the `boikot.json` dataset [in progress]

- `rustscrape` - rust tool that can read content from webpages [pdf support in progress]

- `migrations` - scripts that operate on the `boikot.json` dataset, modifying it eg. adding/tweaking information for all entries at once

- `render.js` - a script which is used to statically render the boikot.xyz site

## notes

get all tags in use
```
jq ".companies | map(.tags)" ../boikot.json | grep '"' | grep -oE "(\w| )+" | sort | uniq
```

## data sources

list of companies operating in russia
    https://som.yale.edu/story/2022/over-1000-companies-have-curtailed-operations-russia-some-remain
bds list
    https://masjidalaqsa.com/israeli-product-checker-boycott-list
search engines
    use multiple queries
twitter
bluesky
wikipedia
court filings
news apis
news sites
ethhicalconsumer/goodonyou
company report
goodjobsfirst violation trackers

