import { describe, it, expect, beforeEach, afterEach } from "vitest";
import _ from "lodash";
import * as fs from "fs";

import { getWikipediaInfo, getWikipediaPage } from "./wiki.js";
import { getRecord } from "./getRecord.js";
import { searchEcosia } from "./search.js";
import { addRecord, removeRecord } from "./addRecord.js";
import { askLlama4, askQwen, askGemma, embed } from "./llm.js";
import { getInvestigationPrompt, getSummarisationPrompt } from "./prompts.js";
import { metaSearchResults, hondaSearchResults, dysonSearchResults, amazonSearchResults, gildanSearchResults, morrisonsSearchResults, barclaysInfo, pepsicoInfo, ikeaInfo, greggsInfo, nintendoInfo } from "./testData.js";
import { dist, length, cosineSimilarity } from "./math.js";
import { closestEmbedding, mostAlignedEmbedding } from "./filter.js";
import boikot from "../boikot.json" with { type: "json" };

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

const targetSummarisationResults = [
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

            expect(response).toMatch(/single(-| )use plastic/i);
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
];

const llmOptions = [ askQwen, askLlama4, askGemma ];

llmOptions.forEach( llmFunc =>
  describe( llmFunc.name, () => {
    it("responds as asked", async () => {
      const response = await llmFunc("Please respond to this message with the string \"beans\"")
      expect(response).toBe("beans");
    });
  
    it("can add up", async () => {
      const response = await llmFunc("What is nine plus ten? respond with just a number, eg. \"45\" or \"32\". Think briefly but correctly."); // need to tell Qwen not to think too much
      expect(response).toBe("19");
    });
  
    it("can answer yes or no", async () => {
      const response = await llmFunc(
          "Is it generally correct to say sand tastes better than chocolate? " +
          "Please respond with only one of the following options and no other characters or punctuation: \"Yes\" or \"No\""
      )
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
  
    targetSummarisationResults.forEach(
        ({
          companyName, companyInfo,
          targetResultCheck,
        }) =>
            it(`can write an ethics summary for ${companyName}`, async () => {
                // todo add more test cases
                const summarisationPrompt = getSummarisationPrompt(
                  companyName, companyInfo
                );
                const response = await llmFunc(summarisationPrompt);
                console.log(response);
                await targetResultCheck(response);
            })
    );

    it("says who it is", async () => {
        const response = await llmFunc("Who are you?");
        console.log(response);
        expect(response).toMatch(/(I am)|(I'm)/);
        expect(response).toContain("investigative journalist");
    });

    // todo add function that sorts sources and removes unused ones
    // todo function that filters youtube etc out of results
    // todo extract ethics section and sources from wikipedia
    // todo maybe just return urls from investigate prompt
    // todo let llm check result and trigger error
  })
);

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

