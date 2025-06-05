#!/usr/env/node


export const getInvestigationPrompt = (companyName, searchResults, numberToSelect=10) => `
You are an investigative journalist looking into the ethics of ${companyName}.
Here are some results from a search engine - please read over them and let me know the numbers of the ${numberToSelect} most relevent news articles to read for an investigation of the ethics of ${companyName}.
Articles from reputable news sources are preferred.

${searchResults}

Please respond with the numbers of the ${numberToSelect} most relevent news articles to read for an investigation of the ethics of ${companyName}.
Please respond with only the numbers of the articles, in comma seperated sorted order eg. 1,2,3 etc - and no other text.
`;
