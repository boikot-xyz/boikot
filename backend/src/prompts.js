#!/usr/bin/env node

import boikot from "../../boikot.json" with { type: "json" };


export const getInvestigationPrompt = (companyName, searchResults, numberToSelect=10) => `
You are investigating the ethics of ${companyName}.
Here are some results from a search engine - please read over them and let me know the numbers of the 3-10 most relevant news articles to read for an investigation of the ethics of the company.

${searchResults}

Please respond with the numbers of the most relevent news articles to read for an investigation of the ethics of ${companyName}.
- Select between 3 and 10 articles - only include the most relevant articles.
- We are looking for hard-hitting, factual journalism, so only include articles from reputable, primary news sources. Compilation sites including wikipedia and lists of unethical actions done by a company are not primary sources.
- Some results come from essay, homework, or study websites, or are broad overviews like "The Ethics of Company X", which are not primary sources - make sure to avoid these.
- Resources published by the company itself could be biased, like its annual report, sustainability page or ethics statements, so only include articles published by third parties.
- We can't cite videos easily, so only include written news articles, and make sure to avoid videos published on www.youtube.com or other video hosts
- Please respond with only the numbers of the articles, in comma seperated sorted order eg. 1,2,3 etc - and no other text.
`;

export const getSummarisePrompt = (companyName, articleText) => `
The following text is taken from an article published online. We need to summarise the article as part of our research into the ethics of ${companyName} Please summarise the article into a few sentences:

${articleText}

Please respond with the article summary and no other text.
- Make sure to include all relevant points about the ethical track record of ${companyName} in your summary.
- Try to include particulary relevant figures or quotations from the article.
- Ignore other text from the webpage which is not part of the main article, like links or other headlines.
`;

export const getCombinePrompt = (companyName, companyInfo ) => `
You are an investigative journalist looking into the ethical track record of ${companyName}. You have collected some information about the company and now your task is to compile the information into a two-sentence company ethics report that can be published online.

Here are some examples of two-sentence company ethics reports you have written in the past:

- ${boikot.companies.apple.comment}

- ${boikot.companies.bbc.comment}

Below is the information you have collected about ${companyName} from various sources. Some of them may not contain relevant information about the ethics of ${companyName}.

${companyInfo}

Please summarise this information into a two-sentence summary of the ethics of ${companyName}, like the examples above.
- Begin with "${companyName} is a "
- Only use the information above in your summary. If there is insufficient information provided to write an ethics summary from, respond with "INSUFFICIENT INFORMATION AVAILABLE"
- Make sure you include a few specific words on all the unethical actions ${companyName} has taken.
- After you include information from a given source, include its citation number eg. [1], [2] or [3].
- Our citation engine is not that smart, so if you want to add 2 citiations together, do it like this: [4][5], not like this: [4, 5].
- Keep your summary succinct like the examples.
- Don't include positive statements about the company that aren't related to specifically ethical actions.
- You are writing only about the ethics of the company, so only cite sources that contain information specifically about the ethics of ${companyName}.
- Respond with your two-sentence ethics summary only and no other text.
`;
