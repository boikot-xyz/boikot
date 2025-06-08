import { describe, it, expect, beforeEach, afterEach } from "vitest";
import _ from "lodash";
import * as fs from "fs";

import { getWikipediaInfo, getWikipediaPage } from "./wiki.js";
import { getRecord } from "./getRecord.js";
import { searchEcosia } from "./search.js";
import { addRecord, removeRecord } from "./addRecord.js";
import { askGroq, askQwen, askGemma, embed } from "./llm.js";
import { getInvestigationPrompt } from "./prompts.js";
import { metaSearchResults, hondaSearchResults, dysonSearchResults } from "./testData.js";
import { dist, length, cosineSimilarity } from "./math.js";
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
        relevantResultNumbers: [5, 7, 9],
    },
    {
        companyName: "Honda",
        searchResults: hondaSearchResults,
        relevantResultNumbers: [2, 4, 6, 7],
    },
    {
        companyName: "Dyson",
        searchResults: dysonSearchResults,
        relevantResultNumbers: [1, 2, 4, 5, 6, 7],
    },
];

const easySummarisationPrompt = `
You are an investigative journalist looking into the ethical track record of Barclays. You have collected some information about the company and now your task is to compile the information into a two-sentence company ethics report that can be published online.

Here are some examples of two-sentence company ethics reports you have written in the past:

- ${boikot.companies.apple.comment}

- ${boikot.companies.bbc.comment}

Below is the information you have collected about Barclays from various sources. Some of them may not contain relevant information about the ethics of Barclays.

- Source [1]:
Barclays is the world's largest funder of fracking and coal

- Source [2]:
Barclays was fined £500 million by the treasury

- Source [3]:
Barclays financial results from 2024 are strong, outperforming expectations

- Source [4]:
Barclays illegally manipulated the price of gold

- Source [5]:
Barclays is one of the oldest banks still in operation today

- Source [6]:
Cats are one of the cutest animals, as voted by our readers

Please summarise this information into a two-sentence summary of the ethics of Barclays, like the examples above.
- Begin with "Barclays is a "
- Make sure you include a few specific words on all the unethical actions Barclays has taken.
- After you include information from a given source, include its citation number eg. [1], [2] or [3].
- Our citation engine is not that smart, so if you want to add 2 citiations together, do it like this: [4][5], not like this: [4, 5].
- Keep your summary succinct like the examples.
- Don't include positive statements about the company that aren't related to specifically ethical actions.
- You are writing only about the ethics of the company, so only cite sources that contain information specifically about the ethics of Barclays.
- Respond with your two-sentence ethics summary only and no other text.
`;

const longSummarisationPrompt = `
`;

const llmOptions = [ askQwen, askGroq, askGemma ];

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
      ({ companyName, searchResults, relevantResultNumbers }) =>
        it(
          `can select relevant search results for ${companyName} from 10`, 
          async () => {
            const investigationPrompt =
              getInvestigationPrompt( companyName, searchResults, 3 );
            const response = await llmFunc(investigationPrompt);
            expect(response).toMatch(/^(\d+)(, ?\d+){2}/);
            const selectedNumbers = response.split(",");
            selectedNumbers.forEach( selectedNumber =>
              expect(relevantResultNumbers).toContain(+selectedNumber)
            );
          },
        )
    );
  
    it.skip("can select relevant search results from 50", async () => {
      // todo add more test cases
      const response = await llmFunc(longerInvestigationPrompt);
      console.log(response);
      expect(response).toMatch(/^(\d+)(, ?\d+){9}/);
      const nonRelevantArticles = [-1];
      nonRelevantArticles.forEach( nonRelevantNumber =>
        expect(response).not.toContain(`[${nonRelevantNumber}]`)
      );
    });
  
    it("can write an easy ethics summary", async () => {
      // todo add more test cases
      const response = await llmFunc(easySummarisationPrompt);
      console.log(response);
  
      expect(response).toMatch(/^Barclays is a/);
  
      expect(response).toContain("[1]");
      expect(response).toContain("[2]");
      expect(response).toContain("[4]");
      expect(response).not.toContain("[3]");
      expect(response).not.toContain("[6]");
  
      expect(response).toContain("fracking");
      expect(response).toMatch(/(£500 million)|(fine)/);
      expect(response).toContain("manipulat");
      expect(response).toContain("gold");
  
      expect(response).toMatch(/^.+\. .+\.$/);
    });
  
    it.skip("can write a more detailed ethics summary", async () => {
      // todo add more test cases
      const response = await llmFunc(easySummarisationPrompt);
      console.log(response);
      return
      //todo
  
      expect(response).toMatch(/^Barclays is a/);
  
      expect(response).toContain("[1]");
      expect(response).toContain("[2]");
      expect(response).toContain("[4]");
      expect(response).not.toContain("[3]");
  
      expect(response).toContain("fracking");
      expect(response).toMatch("£500 million");
      expect(response).toContain("manipulat");
      expect(response).toContain("gold");
  
      expect(response).toMatch(/^.+\. .+\.$/);
    });

    it("says who it is", async () => {
        const response = await llmFunc("Who are you?");
        console.log(response);
        expect(response).toMatch(/(I am)|(I'm)/);
        expect(response).toContain("investigative journalist");
    });

    // todo extract ethics section and sources from wikipedia
    // todo maybe just return urls from investigate prompt
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


