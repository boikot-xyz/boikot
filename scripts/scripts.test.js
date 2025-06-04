import { describe, it, expect } from "vitest";
import _ from "lodash";
import { getWikipediaInfo, getWikipediaPage } from "./wiki.js";
import { getRecord } from "./getRecord.js";
import { searchEcosia } from "./search.js";
import { askGroq, askQwen } from "./llm.js";

const targetWikipediaPages = [
  ["apple", "https://en.wikipedia.org/wiki/Apple_Inc."],
  ["samsung", "https://en.wikipedia.org/wiki/Samsung"],
  ["bp", "https://en.wikipedia.org/wiki/BP"],
  ["channel 4", "https://en.wikipedia.org/wiki/Channel_4"],
  ["byd", "https://en.wikipedia.org/wiki/BYD_Company"],
  ["moonpig", "https://en.wikipedia.org/wiki/Moonpig"],
  ["dell", "https://en.wikipedia.org/wiki/Dell"],
  ["tfl", "https://en.wikipedia.org/wiki/Transport_for_London"],
  ["ikea", "https://en.wikipedia.org/wiki/IKEA"],
  ["abercrombie and fitch", "https://en.wikipedia.org/wiki/Abercrombie_%26_Fitch"],
  ["anker", "https://en.wikipedia.org/wiki/Anker_Innovations"],
  ["b&q", "https://en.wikipedia.org/wiki/B%26Q"],
  ["a24", "https://en.wikipedia.org/wiki/A24"],
  ["minute maid", "https://en.wikipedia.org/wiki/Minute_Maid"],
  ["colman's", "https://en.wikipedia.org/wiki/Colman%27s"],
];

describe("getWikipediaPage", () => {
  targetWikipediaPages.forEach(([companyName, expectedUrl]) => {
    it(`returns correct Wikipedia URL for ${companyName}`, async () => {
      const url = await getWikipediaPage(companyName);
      expect(url).toBe(expectedUrl);
    });
  });
});

const targetWikipediaInfos = [
  ["apple", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/Apple_Inc.",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    siteUrl: "https://www.apple.com/",
  }],
  ["samsung", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/Samsung",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Samsung_Black_icon.svg",
    siteUrl: "https://www.samsung.com/",
  }],
  ["bp", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/BP",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/d2/BP_Helios_logo.svg",
    siteUrl: "https://bp.com/",
  }],
  ["channel 4", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/Channel_4",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/9/9b/Channel_4_%28On_Demand%29_2023.svg",
    siteUrl: "http://www.channel4.com/",
  }],
  ["byd", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/BYD_Company",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/BYD_Company%2C_Ltd._-_Logo.svg",
    siteUrl: "https://www.bydglobal.com/",
  }],
  ["moonpig", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/Moonpig",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/a/aa/Moonpig_Logo.svg",
    siteUrl: "http://moonpig.com/",
  }],
  ["dell", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/Dell",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/18/Dell_logo_2016.svg",
    siteUrl: "https://www.dell.com/",
  }],
  ["tfl", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/Transport_for_London",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/TfL_roundel_%28no_text%29.svg",
    siteUrl: "https://tfl.gov.uk/",
  }],
  ["ikea", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/IKEA",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Ikea_logo.svg",
    siteUrl: "https://about.ikea.com/",
  }],
  ["abercrombie and fitch", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/Abercrombie_%26_Fitch",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Abercrombie_%26_Fitch_logo.svg",
    siteUrl: "http://abercrombie.com/",
  }],
  ["anker", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/Anker_Innovations",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Anker_Innovations_Co._Ltd._Logo.png",
    siteUrl: "https://anker.com/",
  }],
  ["b&q", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/B%26Q",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c0/B%26Q_company_logo.svg",
    siteUrl: "https://diy.com/",
  }],
  ["a24", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/A24",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b7/A24_logo.svg",
    siteUrl: "http://a24films.com/",
  }],
  ["minute maid", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/Minute_Maid",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Minute_Maid_2023.svg",
    siteUrl: "http://minutemaid.com/",
  }],
  ["colman's", {
    wikipediaUrl: "https://en.wikipedia.org/wiki/Colman%27s",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5b/Buckinghamshire_Railway_Colmans_advert.jpg",
    siteUrl: undefined,
  }],
];

describe("getWikipediaInfo", () => {
  targetWikipediaInfos.forEach(([companyName, expected]) => {
    it(`returns correct info for ${companyName}`, async () => {
      const result = await getWikipediaInfo(companyName);
      expect(result).toEqual(expected);
    });
  });
});


const targetNames = [
  ["apple", "Apple"],
  ["samsung", "Samsung"],
  ["byd", "BYD"],
  ["moonpig", "Moonpig"],
  ["dell", "Dell"],
  ["tfl", "TfL"],
  ["ikea", "IKEA"],
  ["abercrombie and fitch", "Abercrombie & Fitch"],
  ["anker", "Anker"],
  ["minute maid", "Minute Maid"],
  ["colman's", "Colman's"],
  ["7-11", "7-Eleven"],
  ["三菱自動車工業株式会社", "Mitsubishi"],
];

describe("getRecord", () => {
  targetNames.forEach(([companyName, expectedName]) => {
    it(`returns correct record for ${companyName}`, async () => {
      const record = getRecord(companyName);
      expect(record).toBeDefined();
      expect(record.score).toBeDefined();
      expect(record.names[0]).toBe(expectedName);
    });
  });
});


describe("searchEcosia", () => {
  it("returns search results", async () => {
    const results = await searchEcosia("current headlines");
    expect(results[0]).toHaveProperty("title");
    expect(results[0]).toHaveProperty("description");
    expect(results[0]).toHaveProperty("url");
    expect(results.length).toBe(50);
  });
});


const investigationPrompt = `
You are an investigative journalist looking into the ethics of Meta.
Here are some results from a search engine - please read over them and let me know the numbers of the 3 most relevent news articles to read for an investigation of the ethics of Meta.
Articles from reputable news sources are preferred.

1. I asked Facebook's new AI to write an essay on why Meta is ... - Reddit [https://www.reddit.com/r/ArtificialInteligence/comments/1cdvfuq/i_asked_facebooks_new_ai_to_write_an_essay_on_why/]
26 Apr 2024 ... In addition, Meta has been criticized for its role in perpetuating online hate speech and harassment. Despite promises to address these issues, ...

2. Ask HN: Do you consider working for Meta an ethical issue? [https://news.ycombinator.com/item?id=42077559]
Meta (Facebook) is able to attract some of our best and brightest software ... Capitalism is unethical. Name a public company that gives a flying fart ...

3. The moral dilemma: freelancers seeking work at Meta amid recent ... [https://www.freelanceinformer.com/news/the-moral-dilemma-freelancers-seeking-work-at-meta-amid-recent-controversial-low-performance-job-cuts/]
18 Feb 2025 ... For freelancers looking to secure work on Meta's platforms or any other company that makes what many see as unethical job cuts, this ...

4. Are Meta's AI Profiles Unethical? - Towards Data Science [https://towardsdatascience.com/are-metas-ai-profiles-unethical-a157ec05a58f/]
9 Jan 2025 ... Are Meta's AI Profiles Unethical? As AI becomes further enmeshed into every product we use, what rules should exist to protect humans? James ...

5. Meta accused of 'massive, illegal' data collection operation by ... - CNN [https://www.cnn.com/2024/02/29/tech/meta-data-processing-europe-gdpr]
29 Feb 2024 ... The groups claim that Meta (META) collects an unnecessary amount of information on its users — such as data used to infer their sexual ...

6. An open discussion about Meta's unethical practices, data collection ... [https://www.karencwilson.me/blog/an-open-discussion-about-metas-unethical-practices]
6 Feb 2025 ... An open discussion about Meta's unethical practices, data collection, and our responsibility as small business owners · Meta's recent changes to ...

7. Meta Fined $1.3 Billion for Violating E.U. Data Privacy Rules [https://www.nytimes.com/2023/05/22/business/meta-facebook-eu-privacy-fine.html]
22 May 2023 ... Meta on Monday was fined a record 1.2 billion euros ($1.3 billion) and ordered to stop transferring data collected from Facebook users in Europe to the United ...

8. Facebook became Meta – and the company's dangerous behavior ... [https://theconversation.com/facebook-became-meta-and-the-companys-dangerous-behavior-came-into-sharp-focus-in-2021-4-essential-reads-173417]
20 Dec 2021 ... Meta has, not surprisingly, pushed back against claims of harm despite the revelations in the leaked internal documents. The company has ...

9. Meta settles Cambridge Analytica scandal case for $725m - BBC [https://www.bbc.com/news/technology-64075067]
23 Dec 2022 ... Facebook owner Meta has agreed to pay $725m (£600m) to settle legal action over a data breach linked to political consultancy Cambridge Analytica.

10. Meta Under Fire: The Legal Battle Revealing Big Tech's Ethical ... [https://cdotimes.com/2023/10/25/meta-under-fire-the-legal-battle-revealing-big-techs-ethical-dilemmas/]
25 Oct 2023 ... Meta Platforms Inc., embroiled in a legal tussle that not only questions its operational ethics but also casts a long, scrutinizing shadow over the entire tech ...

Please respond with the numbers of the 3 most relevent news articles to read for an investigation of the ethics of Meta.
Please respond with only the numbers of the articles, in comma seperated sorted order eg. 1,2,3`;

describe("askQwen", () => {
  it("responds as asked", async () => {
    const response = await askQwen("Please respond to this message with the string \"beans\"")
    expect(response).toBe("beans");
  });

  it("can add up", async () => {
    const response = await askQwen("What is nine plus ten? respond with just a number, eg. \"45\" or \"32\"")
    expect(response).toBe("19");
  });

  it("can answer yes or no", async () => {
    const response = await askQwen(
        "Is it generally correct to say sand tastes better than chocolate? " +
        "Please respond with only one of the following options and no other characters or punctuation: \"Yes\" or \"No\""
    )
    expect(response).toBe("No");
  });

  it("can select relevant search results", async () => {
    const response = await askQwen(investigationPrompt);
    expect(response).toBe("5,7,9");
  });
});


describe("askGroq", () => {
  it("responds as asked", async () => {
    const response = await askGroq("Please respond to this message with the string \"beans\"")
    expect(response).toBe("beans");
  });

  it("can add up", async () => {
    const response = await askGroq("What is nine plus ten? respond with just a number, eg. \"45\" or \"32\"")
    expect(response).toBe("19");
  });

  it("can answer yes or no", async () => {
    const response = await askQwen(
        "Is it generally correct to say sand tastes better than chocolate? " +
        "Please respond with only one of the following options and no other characters or punctuation: \"Yes\" or \"No\""
    )
    expect(response).toBe("No");
  });

  it("can select relevant search results", async () => {
    const response = await askGroq(investigationPrompt);
    expect(response).toBe("5,7,9");
  });
});
