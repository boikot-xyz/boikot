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
javascript:( () => { const logoImg = document.querySelector(".infobox-image.logo img") || document.querySelector(".infobox-image img"); const logoUrl = logoImg && logoImg.src .replace("thumb/", "") .replace(/^\/\/upload/, "https://upload") .replace(/\.svg\/[^/]+.(png|jpg)$/, ".svg"); const infoBoxLabels = [...document.querySelectorAll( "table.infobox tr" )]; const siteLabel = infoBoxLabels.filter( el => el.innerText.includes("Website") || el.innerText.includes("URL") )[0]; const siteUrl = siteLavel && siteLabel.querySelector("a").href; document.body.innerHTML = JSON.stringify({ logoUrl, siteUrl }, null, 2); } )()
```

mobile version:
```javascript
javascript:( () => { const logoImg = document.querySelector(".infobox-image.logo img") || document.querySelector(".infobox-image img"); const logoUrl = logoImg && logoImg.src .replace("thumb/", "") .replace(/^\/\/upload/, "https://upload") .replace(/\.svg\/[^/]+.(png|jpg)$/, ".svg"); const infoBoxLabels = [...document.querySelectorAll( "table.infobox tr" )]; const siteLabel = infoBoxLabels.filter( el => el.innerText.includes("Website") || el.innerText.includes("URL") )[0]; const siteUrl = siteLabel && siteLabel.querySelector("a").href; const button = document.createElement("button"); document.body.appendChild(button); button.style.position = "fixed"; button.style.top = "0"; button.style.right = "0"; button.style.background = "red"; button.style.color = "black"; button.style.padding = "10px"; button.style.zIndex = 10000000000; button.innerText = "copyWikiInfo"; button.onclick = async () => {await navigator.clipboard.writeText(JSON.stringify({ logoUrl: logoUrl, siteUrl: siteUrl }, null, 2)); button.remove(); }; ; } )()
```

Copy the url of the current page as a new source:

```javascript
javascript:( async () => { const clipboardString = await navigator.clipboard.readText(); let clipboard; try {  clipboard = JSON.parse(clipboardString); } catch (e) {  clipboard = {}; } const nextKey = Math.max(0, ...Object.keys(clipboard?.sources || {})) + 1; navigator.clipboard.writeText(JSON.stringify({ ...clipboard, sources: { ...( clipboard?.sources || {}), [nextKey.toString()]: window.location.href } }, null, 2)); } )()
```

