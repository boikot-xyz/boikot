#!/usr/env/node


export const getInvestigationPrompt = (companyName, searchResults, numberToSelect=10) => `
You are investigating the ethics of ${companyName}.
Here are some results from a search engine - please read over them and let me know the numbers of the 3-10 most relevant news articles to read for an investigation of the ethics of the company.

${searchResults}

Please respond with the numbers of the most relevent news articles to read for an investigation of the ethics of ${companyName}.
- Select between 3 and 10 articles - only include the most relevant articles.
- We are looking for hard-hitting, factual journalism, so only include articles from reputable, primary news sources. Compilation sites including wikipedia and lists of unethical actions done by a company are not primary sources.
- Some results come from essay, homework, or study websites, or are broad overviews like "The Ethics of Company X", which are not primary sources - make sure to avoid these.
- Resources published by the company itself could be biased, like its annual report, sustainability page or ethics statements, so only include articles published by third parties.
- We can't cite videos easily, so only include written news articles, and make sure to avoid videos eg. anything on www.youtube.com or other video hosts
- Please respond with only the numbers of the articles, in comma seperated sorted order eg. 1,2,3 etc - and no other text.
`;
