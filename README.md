# boikot 🙅‍♀️

boikot is a community-led initiative to make data on company ethics transparent and accessible.

We are building a community-curated, transparent, freely accessible collection of corporate ethics records. By documenting ethical and unethical business practices, we aim to inform consumer choice, raise the cost of harmful business decisions, and incentivise companies to act responsibly in the public interest.

All of our services and data are offered free to the public under the terms of the GPL v3 licence. You can download our full companies dataset from the file called [`boikot.json`](https://raw.githubusercontent.com/boikot-xyz/boikot/main/boikot.json) above.

The main product being worked on is the [boikot.xyz](https://boikot.xyz) website which provides access to our data and tools to add new records to it. This is a react project in the `site` directory. There also some tools for collecting and summarising information in the `scripts` and `backend` directories.

## MCP

We also have an MCP server that exposes a tool to lookup company ethics information. This is available from the URL `https://mcp.boikot.xyz/mcp` with no authentication needed. It provides one tool called `lookup_company_information` which takes one parameter `company_name` and returns information about the company's ethics.

## the dataset

the [`boikot.json`](https://raw.githubusercontent.com/boikot-xyz/boikot/main/boikot.json) file is a database of the ethical and unethical practices of different companies. Each item in the "companies" object represents a company ethics record. Each of these items has a "names" areay containing names that can be used for the company, of which the first entry is the most commonly used name. They also have a "comment" string which is a comment on the ethics of the company, with sources denoted by numbers in square brackets eg. \[1\]\[2\]. The URLs for these sources are in the "sources" object which is a mapping from the source numbers to URLs. Each company also has tags in the "tags" array, which are strings that describe the company. Finally each company has a "logoUrl" and "siteUrl" which are URLs for the company's logo image and website. There is an "updatedAt" timestamp on each item to track when it was last updated.

## links

Corporate Research site: https://www.corp-research.org/home-page

Impact of boycotts on McDonalds: https://m.youtube.com/watch?v=K9Uf3eUWKE8
