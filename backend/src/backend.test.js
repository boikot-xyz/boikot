import { describe, it, expect, beforeEach, afterEach } from "vitest";
import _ from "lodash";
import * as fs from "fs";

import { getWikipediaInfo, getWikipediaPage } from "./wiki.js";
import { getRecord } from "./getRecord.js";
import { searchEcosia } from "./search.js";
import { addRecord, removeRecord } from "./addRecord.js";
import { askLlama4, askQwen, askGemma, askGPTOSS, embed } from "./llm.js";
import { getInvestigationPrompt, getSummarisePrompt, getCombinePrompt } from "./prompts.js";
import { metaSearchResults, hondaSearchResults, dysonSearchResults, amazonSearchResults, gildanSearchResults, morrisonsSearchResults, appleArticleText, kelloggsArticleText, wagamamaArticleText, barclaysInfo, pepsicoInfo, ikeaInfo, greggsInfo, nintendoInfo, burberryInfo, hugePrompt } from "./testData.js";
import { dist, length, cosineSimilarity } from "./math.js";
import { closestEmbedding, mostAlignedEmbedding } from "./filter.js";
import { sortSources } from "./assemble.js";
import { rustscrape } from "../rustscrape/rustscrape.js";
import boikot from "../../boikot.json" with { type: "json" };

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


const testCompanyRecord = {
    "names": [
        "Test Company",
        "Test Co.",
        "TestInc"
    ],
    "comment": "Test Company is a American supermarket chain that has mistreated and underpaid its workers [1][2][3][4][5].",
    "sources": {
        "1": "https://www.test-link.com/1/",
        "2": "https://www.test-link.com/2/",
        "3": "https://www.test-link.com/3/",
        "4": "https://www.test-link.com/4/",
        "5": "https://www.test-link.com/5/"
    },
    "tags": [
        "retail",
        "supermarket"
    ],
    "score": 40,
    "ownedBy": [],
    "logoUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e0/test.svg",
    "siteUrl": "http://www.test-co.com/",
    "updatedAt": "2025-05-21T19:29:06.368Z"
};

describe("addRecord", () => {
  beforeEach( async () =>
    await fs.promises.copyFile( "../boikot.json", "./boikot.test.json" )
  );

  afterEach( async () =>
    await fs.promises.rm( "./boikot.test.json" )
  );

  it("can add a record", async () => {
    let boikot = JSON.parse( await fs.promises.readFile( "boikot.test.json" ));
    const lengthBefore = Object.values(boikot.companies).length;

    await addRecord( testCompanyRecord, "./boikot.test.json" );

    boikot = JSON.parse( await fs.promises.readFile( "boikot.test.json" ));
    const lengthAfter = Object.values(boikot.companies).length;
    const entry = boikot.companies[ "test-company" ];
    
    expect( lengthAfter ).toBe( lengthBefore + 1 );
    expect( entry ).toBeDefined();
    expect( entry.names ).toBeDefined();
    expect( Object.keys(entry.sources).length ).toBe(5);
    expect( entry.logoUrl ).toBe( "https://upload.wikimedia.org/wikipedia/commons/e/e0/test.svg" );
  });

  it("doesn't overwrite", async () => {
    let boikot = JSON.parse( await fs.promises.readFile( "boikot.test.json" ));
    const lengthBefore = Object.values(boikot.companies).length;

    expect( addRecord( { names: [ "ALDI" ] }, "./boikot.test.json" ) ).rejects.toThrow();

    boikot = JSON.parse( await fs.promises.readFile( "boikot.test.json" ));
    const lengthAfter = Object.values(boikot.companies).length;
    const entry = boikot.companies[ "aldi" ];
    
    expect( lengthAfter ).toBe( lengthBefore );
    expect( entry ).toBeDefined();
    expect( entry.score ).toBeDefined();
    expect( entry.logoUrl ).toBeDefined();
  });
});


const targetInvestigationResults = [
    {
        companyName: "Meta",
        searchResults: metaSearchResults,
        relevantResultNumbers: [5, 7, 8, 9, 10],
        requiredResultNumbers: [5, 7, 9],
    },
    {
        companyName: "Honda",
        searchResults: hondaSearchResults,
        relevantResultNumbers: [2, 4, 6, 7, 9],
        requiredResultNumbers: [2, 4],
    },
    {
        companyName: "Dyson",
        searchResults: dysonSearchResults,
        relevantResultNumbers: [1, 2, 4, 5, 6, 7, 9, 10],
        requiredResultNumbers: [],
    },
    {
        companyName: "Amazon",
        searchResults: amazonSearchResults,
        relevantResultNumbers: [
            2, 5, 6, 7, 9, 13, 14, 16, 19, 22, 32, 38, 39, 42, 43, 44, 48, 49, 50
        ],
        requiredResultNumbers: [2, 7, 38],
    },
    {
        companyName: "Gildan",
        searchResults: gildanSearchResults,
        relevantResultNumbers: [
            2, 4, 6, 8, 10, 12, 20, 23, 33, 33, 35, 39, 45
        ],
        requiredResultNumbers: [4, 6],
    },
    {
        companyName: "Morrisons",
        searchResults: morrisonsSearchResults,
        relevantResultNumbers: [
            3, 5, 6, 7, 8, 9, 13, 14, 15, 16, 18, 19, 20, 21, 24, 27, 31, 35
        ],
        requiredResultNumbers: [3, 5, 8, 9],
    },
];

const targetSummariseResults = [
    {
        companyName: "Apple",
        articleText: appleArticleText,
        targetResultCheck: async response => {
            expect(response.split(" ").length).toBeLessThan(600);
            expect(response).toContain("Apple");
            expect(response).toMatch(/(child )?labou?r/i);
            expect(response).toMatch(/mining|mineral|mine/i);
        },
    },
    {
        companyName: "Kellogg's",
        articleText: kelloggsArticleText,
        targetResultCheck: async response => {
            expect(response.split(" ").length).toBeLessThan(600);
            expect(response).toMatch(/Kellogg/);
            expect(response).toMatch(/child/i);
            expect(response).toMatch(/claims|misleading|dubious|questionable|false/i);
        },
    },
    {
        companyName: "Wagamama",
        articleText: wagamamaArticleText,
        targetResultCheck: async response => {
            expect(response.split(" ").length).toBeLessThan(600);
            expect(response).toContain("Wagamama");
            expect(response).toMatch(/pay|paid/i);
        },
    },
];

const targetEthicsSummaryResults = [
    {
        companyName: "Barclays",
        companyInfo: barclaysInfo,
        targetResultCheck: async response => {
            expect(response).toMatch(/^Barclays is a/);
            expect(response).toMatch(/^.+\. .+\.$/);
            expect(response.split(". ").length).toBe(2);

            expect(response).toContain("[1]");
            expect(response).toContain("[2]");
            expect(response).toContain("[4]");
            expect(response).not.toContain("[3]");
            expect(response).not.toContain("[6]");

            expect(response).toContain("fracking");
            expect(response).toMatch(/(£500 million)|(fine)/);
            expect(response).toContain("manipulat");
            expect(response).toContain("gold");
        },
    },
    {
        companyName: "Pepsico",
        companyInfo: pepsicoInfo,
        targetResultCheck: async response => {
            expect(response).toMatch(/^Pepsico is a/);
            expect(response).toMatch(/^.+\. .+\.$/);
            expect(response.split(". ").length).toBe(2);

            expect(response).toContain("[1]");
            expect(response).toContain("[2]");
            expect(response).toContain("[5]");
            expect(response).not.toContain("[3]");
            expect(response).not.toContain("[4]");
            expect(response).not.toContain("[6]");

            expect(response).toMatch(/single.use plastic/i);
            expect(response).toContain("illegal rainforest destruction");
            expect(response).toContain("water shortage");
            expect(response).not.toContain("stealing");
            expect(response).not.toContain("cherry");
            expect(response).not.toContain("Coca");
            expect(response).not.toContain("Barclays");
        },
    },
    {
        companyName: "IKEA",
        companyInfo: ikeaInfo,
        targetResultCheck: async response => {
            expect(response).toMatch(/^IKEA is a/i);
            expect(response).toMatch(/^.+\. .+\.$/);
            expect(response.split(". ").length).toBe(2);

            expect(response).toContain("[2]");
            expect(response).toContain("[3]");
            expect(response).toContain("[4]");
            expect(response).toContain("[5]");
            expect(response).not.toContain("[1]");

            expect(response).toMatch(/logging/i);
            expect(response).toMatch(/protected/i);
            expect(response).toMatch(/(150.+tonnes)|(landfill)/i);
            expect(response).toMatch(/forced.+labou?r/i);
            expect(response).toMatch(/nazi/i);
            expect(response).not.toMatch(/bike|biking/);
        },
    },
    {
        companyName: "Greggs",
        companyInfo: greggsInfo,
        targetResultCheck: async response => {
            expect(response).toMatch(/^Greggs is a/i);
            expect(response).toMatch(/^.+\. .+\.$/);
            expect(response.split(". ").length).toBe(2);

            expect(response).toContain("[1]");
            expect(response).toContain("[3]");
            expect(response).toContain("[4]");
            expect(response).not.toContain("[2]");

            expect(response).toMatch(/pay/i);
            expect(response).toMatch(/(horse ?meat)|(vegan)/i);
        },
    },
    {
        companyName: "Nintendo",
        companyInfo: nintendoInfo,
        targetResultCheck: async response => {
            expect(response).toMatch(/^Nintendo is a/i);
            expect(response).toMatch(/^.+\. .+\.$/);
            expect(response.split(". ").length).toBe(2);

            expect(response).toContain("[1]");
            expect(response).toContain("[2]");
            expect(response).toContain("[4]");

            expect(response).toMatch(/sexual|misconduct|harassment/i);
            expect(response).toMatch(/price.fixing/i);
        },
    },
    {
        companyName: "Burberry",
        companyInfo: burberryInfo,
        targetResultCheck: async response => {
            expect(response).toContain("INSUFFICIENT INFORMATION AVAILABLE");
        },
    },
];

const llmOptions = [ askQwen, askLlama4, askGemma, askGPTOSS ];

llmOptions.forEach( llmFunc =>
  describe( llmFunc.name, () => {
    it("responds as asked", async () => {
      const response = await llmFunc("Please respond to this message with the string \"beans\"")
      console.log(response);
      expect(response).toBe("beans");
    });
  
    it("can add up", async () => {
      const response = await llmFunc("What is nine plus ten? respond with just a number, eg. \"45\" or \"32\". Think briefly but correctly."); // need to tell Qwen not to think too much
      console.log(response);
      expect(response).toBe("19");
    });
  
    it("can answer yes or no", async () => {
      const response = await llmFunc(
          "Is it generally correct to say sand tastes better than chocolate? " +
          "Please respond with only one of the following options and no other characters or punctuation: \"Yes\" or \"No\""
      );
      console.log(response);
      expect(response).toBe("No");
    });

    targetInvestigationResults.forEach(
      ({
          companyName, searchResults,
          relevantResultNumbers, requiredResultNumbers
      }) =>
        it(
          `can select relevant search results for ${companyName}`, 
          async () => {
            const investigationPrompt =
              getInvestigationPrompt( companyName, searchResults, 3 );
            const response = await llmFunc(investigationPrompt);
            console.log(response);
            expect(response).toMatch(/^(\d+)(, ?\d+){2,9}/);
            const selectedNumbers = response.split(",").map( x => +x );
            selectedNumbers.forEach( selectedNumber =>
              expect(relevantResultNumbers).toContain(selectedNumber)
            );
            requiredResultNumbers.forEach( requiredNumber =>
              expect(selectedNumbers).toContain(requiredNumber)
            );
          },
        )
    );

    targetSummariseResults.forEach(
      ({ companyName, articleText, targetResultCheck }) =>
        it(
          `can summarise an article for ${companyName}`, 
          async () => {
            const summarisePrompt =
              getSummarisePrompt( companyName, articleText );
            const response = await llmFunc(summarisePrompt);
            console.log(response);
            await targetResultCheck(response);
          },
        )
    );
  
    targetEthicsSummaryResults.forEach(
        ({
          companyName, companyInfo,
          targetResultCheck,
        }) =>
            it(`can write an ethics summary for ${companyName}`, async () => {
                // todo add more test cases
                const combinePrompt = getCombinePrompt(
                  companyName, companyInfo
                );
                const response = await llmFunc(combinePrompt);
                console.log(response);
                await targetResultCheck(response);
            })
    );

    it("says who it is", async () => {
        const response = await llmFunc("Who are you?");
        console.log(response);
        expect(response).toMatch(/(I am)|(I'm)|(I’m)/);
        expect(response).toContain("investigative journalist");
    });

    it("can generate JSON", async () => {
        const response = await llmFunc(
            "Please generate some sample JSON data that can be parsed by JSON.parse. Respond with JSON data and nothing else."
        );
        console.log(response);
        JSON.parse(response.match(/{.+}/s)[0]);
    });

    it.skip("can take a huge input", async () => {
        const response = await llmFunc(hugePrompt);
        console.log(response);
        expect(response).toMatch(/co.op/i);
    });

    // extract text from webpage including links
    // todo agentic crawl
    // todo function that filters youtube etc out of results
    // todo ability to get company names and ticker
    // todo ability to get tags
    // todo ability to set ownedBy
  })
);


const sortSourcesTargets = [
    {
        companyName: "empty",
        before: {
            summaryText: "",
            sources: {},
        },
        target: {
            summaryText: "",
            sources: {},
        },
    },
    {
        companyName: "Gap",
        before: {
            summaryText: "Gap is an American clothing conglomerate that has sourced garments from factories with squalid conditions, wage nonpayment and mandatory overtime, which have forced employees to have abortions, and where employees have been sexually assaulted [10][2][1][0]. GAP has also sold clothes produced by child labour [12345678] and forced labour of Uyghur Muslims [11].",
            sources: {
                "10": "https://www.globalcitizen.org/en/content/hm-gap-factory-abuse-fast-fashion-workers/",
                "2": "https://www.independent.co.uk/news/shirts-for-the-fashionable-at-a-price-paid-in-human-misery-on-us-soil-the-gap-workers-are-forced-to-1121362.html",
                "1": "https://web.archive.org/web/20170915133212/http://www.msmagazine.com/spring2006/paradise_full.asp",
                "3": "https://webb.archive.org/web/20130921061502/http://articles.washingtonpost.com/2012-12-09/world/35721716_1_samsung-chairman-smartphone-market-samsung-credit-card",
                "beans": "https://webbb.archive.org/web/20130921061502/http://articles.washingtonpost.com/2012-12-09/world/35721716_1_samsung-chairman-smartphone-market-samsung-credit-card",
                "0": "https://wayback.archive-it.org/all/20080309041041/http://www.nlcnet.org/documents/Jordan_PDF_Web/04_Western.pdf",
                "12345678": "http://news.bbc.co.uk/1/hi/world/south_asia/7066019.stm",
                "11": "https://archive.is/GSvdC"
            },
        },
        target: {
            summaryText: "Gap is an American clothing conglomerate that has sourced garments from factories with squalid conditions, wage nonpayment and mandatory overtime, which have forced employees to have abortions, and where employees have been sexually assaulted [1][2][3][4]. GAP has also sold clothes produced by child labour [5] and forced labour of Uyghur Muslims [6].",
            sources: {
                "1": "https://www.globalcitizen.org/en/content/hm-gap-factory-abuse-fast-fashion-workers/",
                "2": "https://www.independent.co.uk/news/shirts-for-the-fashionable-at-a-price-paid-in-human-misery-on-us-soil-the-gap-workers-are-forced-to-1121362.html",
                "3": "https://web.archive.org/web/20170915133212/http://www.msmagazine.com/spring2006/paradise_full.asp",
                "4": "https://wayback.archive-it.org/all/20080309041041/http://www.nlcnet.org/documents/Jordan_PDF_Web/04_Western.pdf",
                "5": "http://news.bbc.co.uk/1/hi/world/south_asia/7066019.stm",
                "6": "https://archive.is/GSvdC"
            },
        },
    },
    {
        companyName: "Samsung",
        before: {
            summaryText: "Samsung is a South Korean conglomerate which is the world's largest mobile phone and microchip manufacturer [1][5]. Samsung accounts for over 20% of South Korean exports [3] and has an outsized influence in the nation [4], and has been involved in bribery [2], anti-union activities [6], and price fixing [100].",
            sources: {
                "1": "https://web.archive.org/web/20120428062632/http://www.isuppli.com/Mobile-and-Wireless-Communications/News/Pages/Samsung-Overtakes-Nokia-for-Cellphone-Lead.aspx",
                "5": "https://web.archive.org/web/20180525234650/https://techcrunch.com/2018/01/30/samsung-intel-worlds-largest-chipmaker/",
                "3": "https://web.archive.org/web/20110503224019/http://business.timesonline.co.uk/tol/business/industry_sectors/technology/article3764352.ece",
                "4": "https://web.archive.org/web/20130921061502/http://articles.washingtonpost.com/2012-12-09/world/35721716_1_samsung-chairman-smartphone-market-samsung-credit-card",
                "12": "https://webb.archive.org/web/20130921061502/http://articles.washingtonpost.com/2012-12-09/world/35721716_1_samsung-chairman-smartphone-market-samsung-credit-card",
                "2": "https://web.archive.org/web/20170701085942/http://www.nytimes.com/2007/11/06/business/worldbusiness/06iht-samsung.1.8210181.html?pagewanted=all&_r=0",
                "6": "https://web.archive.org/web/20190627140032/http://english.hani.co.kr/arti/english_edition/e_international/899427.html",
                "100": "https://web.archive.org/web/20100707041505/http://europa.eu/rapid/pressReleasesAction.do?reference=IP/10/586"
            },
        },
        target: {
            summaryText: "Samsung is a South Korean conglomerate which is the world's largest mobile phone and microchip manufacturer [1][2]. Samsung accounts for over 20% of South Korean exports [3] and has an outsized influence in the nation [4], and has been involved in bribery [5], anti-union activities [6], and price fixing [7].",
            sources: {
                "1": "https://web.archive.org/web/20120428062632/http://www.isuppli.com/Mobile-and-Wireless-Communications/News/Pages/Samsung-Overtakes-Nokia-for-Cellphone-Lead.aspx",
                "2": "https://web.archive.org/web/20180525234650/https://techcrunch.com/2018/01/30/samsung-intel-worlds-largest-chipmaker/",
                "3": "https://web.archive.org/web/20110503224019/http://business.timesonline.co.uk/tol/business/industry_sectors/technology/article3764352.ece",
                "4": "https://web.archive.org/web/20130921061502/http://articles.washingtonpost.com/2012-12-09/world/35721716_1_samsung-chairman-smartphone-market-samsung-credit-card",
                "5": "https://web.archive.org/web/20170701085942/http://www.nytimes.com/2007/11/06/business/worldbusiness/06iht-samsung.1.8210181.html?pagewanted=all&_r=0",
                "6": "https://web.archive.org/web/20190627140032/http://english.hani.co.kr/arti/english_edition/e_international/899427.html",
                "7": "https://web.archive.org/web/20100707041505/http://europa.eu/rapid/pressReleasesAction.do?reference=IP/10/586"
            },
        },
    },
    {
        companyName: "Nestle",
        before: {
            summaryText: "Nestlé is the world's largest food and beverage company which has been named by Ukraine as an International Sponsor of War [12], sourced cocoa produced by child labour in West Africa [1][3], and questioned whether access to drinking water should be a human right [2]. The company has made some positive efforts like improving agriculture practices and building schools for the children of their farmers [5].",
            sources: {
                "1": "https://web.archive.org/web/20081226141935/http://news.bbc.co.uk/1/hi/world/africa/1272522.stm",
                "3": "https://web.archive.org/web/20090114115945/http://news.bbc.co.uk/2/hi/africa/1311982.stm",
                "5": "https://web.archive.org/web/20160103032603/http://www.mnn.com/food/healthy-eating/stories/what-does-the-cocoa-plan-label-on-chocolate-mean",
                "2": "https://web.archive.org/web/20170629043128/http://www.thenational.ae/arts-culture/the-human-rights-and-wrongs-of-nestl-and-water-for-all",
                "12": "https://zmina.info/en/news-en/nestle-listed-as-international-war-sponsor-by-ukraines-anti-corruption-agency/",
            },
        },
        target: {
            summaryText: "Nestlé is the world's largest food and beverage company which has been named by Ukraine as an International Sponsor of War [1], sourced cocoa produced by child labour in West Africa [2][3], and questioned whether access to drinking water should be a human right [4]. The company has made some positive efforts like improving agriculture practices and building schools for the children of their farmers [5].",
            sources: {
                "1": "https://zmina.info/en/news-en/nestle-listed-as-international-war-sponsor-by-ukraines-anti-corruption-agency/",
                "2": "https://web.archive.org/web/20081226141935/http://news.bbc.co.uk/1/hi/world/africa/1272522.stm",
                "3": "https://web.archive.org/web/20090114115945/http://news.bbc.co.uk/2/hi/africa/1311982.stm",
                "4": "https://web.archive.org/web/20170629043128/http://www.thenational.ae/arts-culture/the-human-rights-and-wrongs-of-nestl-and-water-for-all",
                "5": "https://web.archive.org/web/20160103032603/http://www.mnn.com/food/healthy-eating/stories/what-does-the-cocoa-plan-label-on-chocolate-mean"
            },
        },
    },
];

describe("sortSources", () => {
    sortSourcesTargets.forEach(
        ({ companyName, before, target }) => {
            it(`can sort sources for ${companyName}`, () => {
                const [ sortedSummaryText, sortedSources ] =
                    sortSources( before.summaryText, before.sources );
                expect( sortedSummaryText ).toBe( target.summaryText );
                expect( sortedSources ).toEqual( target.sources );
            });
        });
});

describe("dist", () => {
    it("can find the distance", () => {
        let d = dist([1], [2]);
        expect(d).toBe( 1 );

        d = dist([0,0], [0,1]);
        expect(d).toBe( 1 );

        d = dist([0,0], [1,1]);
        expect(d).toBe( Math.sqrt(2) );

        d = dist([0,0,2], [-1,1,4]);
        expect(d).toBe( Math.sqrt(6) );
    });
});

describe("length", () => {
    it("can find the length", () => {
        let l = length([3]);
        expect(l).toBe( 3 );

        l = length([3,4]);
        expect(l).toBe( 5 );

        l = length([-1,1]);
        expect(l).toBe( Math.sqrt(2) );

        l = length([-1,1,4]);
        expect(l).toBe( Math.sqrt(18) );
    });
});

describe("cosineSimilarity", () => {
    it("calculates cosine similarity", async () => {

        let s = cosineSimilarity([1], [2]);
        expect(s).toBeCloseTo( 1 );

        s = cosineSimilarity([1,0], [0,1]);
        expect(s).toBeCloseTo( 0 );

        s = cosineSimilarity([1,0], [1,1]);
        expect(s).toBeCloseTo( 1. / Math.sqrt(2) );

        s = cosineSimilarity([2,1,1], [4,2,2]);
        expect(s).toBeCloseTo( 1 );
    });
});

describe("embeddings", () => {
    it("embeds", async () => {
        const e1 = await embed( "hot" );
        const e2 = await embed( "hot" );
        const e3 = await embed( "warm" );
        const e4 = await embed( "cold" );

        expect( dist( e1, e2 ) ).toBe( 0 );
        expect( dist( e1, e3 ) ).toBeLessThan( dist( e1, e4 ) );
    });
});

const bpTargetArticle = `
BP scandal: extremely unethical actions were done by the company
https://www.bbc.co.uk/news/articles/cgmjd8evd0go
27 Apr 2025 ... BP has been found guilty of unethical actions including human trafficking, murder, election interference, environmental damage, mistreatment of workers ...
`;

const bpCandidateArticles = [
`
BP Posts Record Profits
https://www.ft.com/content/df15f13d-310f-47a5-89ed-330a6a379068
30 Jan 2015 ... BP released its EOY report today, with profits reaching record levels never seen before. The British company plans to expand into new oilfields over the next year ...
`,
`
BP Shareholders unimpressed by latest reports
https://www.forbes.com/sites/jemimamcevoy/2023/06/07/bp-shareholders-annoyed/
7 Jun 2023 ... BP shareholders have questioned the company's latest reports, asking if the presentation of strong performance doesn't hide underlying issues with the business ...
`,
`
BP Spills 11 million litres of Oil into the Caspian Sea
https://www.telegraph.co.uk/politics/2025/06/07/bp-oil-spill-caspian-sea/
7 Jun 2025 ... BP today admitted liability for the oil spill near the coast of Kazakhstan. Oil flowed into the sea for several hours as BP's containment procedures failed to ...
`,
];

describe("closestEmbedding", () => {
    it("selects the best article", async () => {
        const result = await closestEmbedding(
            bpCandidateArticles, bpTargetArticle
        );
        expect(result).toContain("BP Spills 11 million litres of Oil");
    });
});

describe("mostAlignedEmbedding", () => {
    it("selects the best article", async () => {
        const result = await mostAlignedEmbedding(
            bpCandidateArticles, bpTargetArticle
        );
        expect(result).toContain("BP Spills 11 million litres of Oil");
    });
});

describe("rustscrape", () => {
    it("can read a webpage", async () => {
        const result = await rustscrape("https://stackabuse.com/executing-shell-commands-with-node-js/");
        expect(result).toContain("Executing Shell Commands with Node.js");
    });

    it("can read a pdf", async () => {
        const result = await rustscrape("https://assets.publishing.service.gov.uk/media/67330b872cccb48648badbaa/ar7-cib-allocation-round-notice.pdf");
        expect(result).toContain("THE CONTRACTS FOR DIFFERENCE (ALLOCATION) REGULATIONS 2014");
    });

    it("can read stackoverflow", async () => {
        const result = await rustscrape("https://meta.stackexchange.com/questions/410975/labs-experiment-launch-stackoverflow-ai?cb=1");
        expect(result).toContain("Labs experiment launch: stackoverflow.ai");
    });

    it("can scrape any webpage", async () => {
        const result = await rustscrape("https://www.cloudflare.com/en-gb/");
        expect(result).toContain("Our connectivity cloud is the best place to");
    });
});

