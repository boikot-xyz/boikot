# backend

these are some information gathering utilities that can be used to collect company ethics data.

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


## bookmarks

These are some bookmarks that make it a bit faster to collect the company data. They add JSON data into your clipboard that you can then paste into the "Merge JSON" thing on the company edit page

Get company website and logo when on its wikipedia page:

```javascript
javascript:( () => { const logoImg = document.querySelector(".infobox-image.logo img") ?? document.querySelector(".infobox-image img"); const logoUrl = logoImg?.src .replace("thumb/", "") .replace(/^\/\/upload/, "https://upload") .replace(/\.svg\/[^/]+.(png|jpg)$/, ".svg"); const infoBoxLabels = [...document.querySelectorAll( "table.infobox tr" )]; const siteLabel = infoBoxLabels.filter( el => el.innerText.includes("Website") || el.innerText.includes("URL") )[0]; const siteUrl = siteLabel?.querySelector("a").href; navigator.clipboard.writeText(JSON.stringify({ logoUrl, siteUrl }, null, 2)); } )()
```

Copy the url of the current page as a new source:

```javascript
javascript:( async () => { const clipboardString = await navigator.clipboard.readText(); let clipboard; try {  clipboard = JSON.parse(clipboardString); } catch (e) {  clipboard = {}; } const nextKey = Math.max(0, ...Object.keys(clipboard?.sources || {})) + 1; navigator.clipboard.writeText(JSON.stringify({ ...clipboard, sources: { ...( clipboard?.sources || {}), [nextKey.toString()]: window.location.href } }, null, 2)); } )()
```

