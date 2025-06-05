import { describe, it, expect, beforeEach, afterEach } from "vitest";
import _ from "lodash";
import * as fs from "fs";

import { getWikipediaInfo, getWikipediaPage } from "./wiki.js";
import { getRecord } from "./getRecord.js";
import { searchEcosia } from "./search.js";
import { addRecord, removeRecord } from "./addRecord.js";
import { askGroq, askQwen, askGemma } from "./llm.js";
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
    const entry = boikot.companies[ "test company" ];
    
    expect( lengthAfter ).toBe( lengthBefore + 1 );
    expect( entry ).toBeDefined();
    expect( entry.names ).toBeDefined();
    expect( Object.keys(entry.sources).length ).toBe(5);
    expect( entry.logoUrl ).toBe( "https://upload.wikimedia.org/wikipedia/commons/e/e0/test.svg" );
  });

  it("doesn't overwrite", async () => {
    let boikot = JSON.parse( await fs.promises.readFile( "boikot.test.json" ));
    const lengthBefore = Object.values(boikot.companies).length;

    try {
      await addRecord( { names: [ "ALDI" ] }, "./boikot.test.json" );
    } catch {} // todo add expects error

    boikot = JSON.parse( await fs.promises.readFile( "boikot.test.json" ));
    const lengthAfter = Object.values(boikot.companies).length;
    const entry = boikot.companies[ "aldi" ];
    
    expect( lengthAfter ).toBe( lengthBefore );
    expect( entry ).toBeDefined();
    expect( entry.score ).toBeDefined();
    expect( entry.logoUrl ).toBeDefined();
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
Please respond with only the numbers of the articles, in comma seperated sorted order eg. 1,2,3 - and no other text.
`;

const longerInvestigationPrompt = `
You are an investigative journalist looking into the ethics of Amazon.
Here are some results from a search engine - please read over them and let me know the numbers of the 10 most relevent news articles to read for an investigation of the ethics of Amazon.
Articles from reputable news sources are preferred.

1. Amazon.com Inc - Ethical Consumer
https://www.ethicalconsumer.org/company-profile/amazoncom-inc
18 Mar 2025 ... Amazon is known for its shameless tax avoidance, workers' rights abuses, environmental impacts and much more. The company has been the subject ...

2. Exhausted workers, polluting journeys: how unethical is next-day ...
https://www.theguardian.com/technology/2022/may/10/next-day-delivery-unethical-amazon-workers-pollution
10 May 2022 ... Exhausted workers, polluting journeys: how unethical is next-day delivery? · An Amazon delivery worker stacks boxes for delivery on a cart in New ...

3. Criticism of Amazon - Wikipedia
https://en.wikipedia.org/wiki/Criticism_of_Amazon
"New York AG Denounces 'Immoral and Inhumane' Firing of Amazon Worker Who Led Protest Over Lack of Coronavirus Protections". Common Dreams. Retrieved March ...

4. Ten reasons to avoid Amazon | Ethical Consumer
https://www.ethicalconsumer.org/retailers/ten-reasons-avoid-amazon
5 Dec 2024 ... 1. Amazon is an aggressive tax avoider. · 2. Amazon has violated workers' rights for years. · 3. Amazon workers say abuse comes at a high price ...

5. Amazon's latest faux par questions the ethics of employee surveillance
https://www.hrdconnect.com/2024/01/24/amazons-latest-faux-par-questions-the-ethics-of-employee-surveillance/
24 Jan 2024 ... Amazon has come under scrutiny in France due to its surveillance practices involving its employees. On Jan 23, 2024, the French data privacy ...

6. Inside the Brutal Business Practices of Amazon—And How It ...
https://www.vanityfair.com/news/story/inside-amazon-business-practices?srsltid=AfmBOoqe3r1zW5U0Tdza27p5t6D_w7VFMn-tcIVwK8Fok0ZCZXef3wsX
23 Apr 2024 ... ... Amazon Jeff Bezos. “On April 23,” their message began, The Wall Street Journal “reported that Amazon employees used sensitive business ...

7. US Labor Department accuses Amazon of failing to keep warehouse ...
https://edition.cnn.com/2023/01/18/tech/amazon-osha-citation
18 Jan 2023 ... Amazon has been accused by federal safety regulators of failing to keep warehouse workers safe from workplace hazards at three US facilities ...

8. A Closer Look at Amazon: Are Unethical Working Conditions on the ...
https://thegeopolitics.com/a-closer-look-at-amazon-are-unethical-working-conditions-on-the-rise/
14 Apr 2021 ... Yet for all of Amazon's faults, the issue of unethical working conditions isn't confined to a single company. If one of the world's largest ...

9. Challenging Amazon report - Criticisms of Amazon | TUC
https://www.tuc.org.uk/node/523929
Working for Amazon. Much of the controversy around Amazon's employment practices focus on their fulfilment centres and distribution networks. The company drive ...

10. CMV: Amazon is not unethical to the point that it deserves boycotting.
https://www.reddit.com/r/changemyview/comments/gnx9kd/cmv_amazon_is_not_unethical_to_the_point_that_it/
21 May 2020 ... CMV: Amazon is not unethical to the point that it deserves boycotting. I see many people including family "boycotting" amazon. (Of course ...

11. Amazon Unethical Behavior.pptx - SlideShare
https://www.slideshare.net/slideshow/amazon-unethical-behaviorpptx/257513047
22 Apr 2023 ... Amazon has been accused of several unethical practices towards its employees. Workers report being paid 9% less than industry standards.

12. Unethical - Biel, Lauren: 9781959618300: Books - Amazon UK
https://www.amazon.co.uk/Unethical-Lauren-Biel/dp/195961830X
Buy Unethical by Biel, Lauren (ISBN: 9781959618300) from Amazon's Book Store. Everyday low prices and free delivery on eligible orders.

13. Amazon under investigation over listings practices - BBC News
https://www.bbc.co.uk/news/business-62064830
6 Jul 2022 ... Amazon is under investigation in the UK over concerns that the company is giving an unfair advantage to certain sellers on its marketplace.

14. Amazon Sued By Federal Trade Commission, Which Says Tech ...
https://deadline.com/2023/06/amazon-sued-by-federal-trade-commission-tricked-prime-subscribers-1235421735/
21 Jun 2023 ... Amazon has been sued by the Federal Trade Commission ... Just scratching the surface of the many unethical business practices of Amazon.

15. Is Amazon Ethical?
https://berkleycenter.georgetown.edu/posts/is-amazon-ethical
2 Jul 2019 ... However, Amazon has been regularly sued for workplace abuse, discrimination, and maltreatment after workers have been left homeless and without ...

16. A Hard-Hitting Investigative Report Into Amazon Shows ... - Forbes
https://www.forbes.com/sites/jackkelly/2021/10/25/a-hard-hitting-investigative-report-into-amazon-shows-that-workers-needs-were-neglected-in-favor-of-getting-goods-delivered-quickly/
25 Oct 2021 ... The Oklahoma Amazon warehouse worker wrote a heartfelt note to Jeff Bezos, the CEO of Amazon at the time, stating that she was being underpaid.

17. Global Human Rights Principles - Amazon Sustainability
https://sustainability.aboutamazon.com/human-rights/principles
Amazon is committed to respecting internationally recognized human rights as defined by international standards and frameworks developed by the United Nations ...

18. Why You Should Avoid Amazon - Students' Union
https://www.thestudentsunion.co.uk/news/article/15570/Why-You-Should-Avoid-Amazon/
With the unethical operations of Amazon, there are huge reasons for you to look to alternative options when shopping.

19. 'I'm not a robot': Amazon workers condemn unsafe, grueling ...
https://www.theguardian.com/technology/2020/feb/05/amazon-workers-protest-unsafe-grueling-conditions-warehouse
5 Feb 2020 ... Employees under pressure to work faster call on retail giant to improve conditions – and take their complaints seriously.

20. Behind the Alarming Expose on Amazon's Workplace Culture -
https://www.youtube.com/watch?v=HHujfrRiWEI
Thumbnail for “Behind the Alarming Expose on Amazon's Workplace Culture -” 17 Aug 2015 ... The New York Times' expose on Amazon's labor practices has put the company on the defense. One former employee said colleagues cried at ...

21. The Ethics of Amazon - Christopher Bigelow - Medium
https://topheradastra.medium.com/the-ethics-of-amazon-174f32d4070b
24 Apr 2022 ... There was a time Barnes & Noble was the biggest bogeyman in the book business–gobbling up the brick and mortar bookselling opportunities ...

22. Wall Street Journal releases report on Amazon's unethical business ...
https://www.commonwealthunion.com/wall-street-journal-releases-report-on-amazons-unethical-business-practices/
23 Dec 2020 ... The newspaper states that Amazon's unethical business practices have allowed the multimillion-dollar company to amass large profits at the expense of other ...

23. Ethical Unicorn | Climate Justice & Creativity
https://ethicalunicorn.com/
Explore climate justice & creativity, Ethical Unicorn shares insights on sustainability, social change & conscious living for a better world.

24. Unethical But Legal Ways To Get Rich Quick eBook : Platinum, Steve
https://www.amazon.co.uk/Unethical-Legal-Ways-Rich-Quick-ebook/dp/B0BHTZTN13
Unethical But Legal Ways To Get Rich Quick eBook : Platinum, Steve: Amazon.co.uk: Kindle Store.

25. Unethical Treatment of Amazon Employees: Challenges and Solutions
https://www.cliffsnotes.com/study-notes/20821917
6 Sept 2024 ... ... unethical treatment towards Amazon workers. The article "War of attrition: why union victories for US workers at Amazon have stalled ...

26. How to be unethical and unprofessional with Amazon - LinkedIn
https://www.linkedin.com/posts/brameshkumar_retailez-private-limited-how-can-you-be-activity-7185547737243791360-dx0D
15 Apr 2024 ... RetailEZ Private Limited - How can you be so unethical and unprofessional while handling an Order for 6 bottles of 'Amazon Brand - Solimo ...

27. Cases of Unethical Business: A Malignant Mentality of Mendacity
https://www.amazon.com/Cases-Unethical-Business-Malignant-Mentality/dp/1521929572
Amazon.com: Cases of Unethical Business: A Malignant Mentality of Mendacity: 9781521929575: Worden, Ph.D., Skip: Books.

28. A Primer on the Illegal and Unethical Uses of Amazon Web Scraping
https://www.blog.datahut.co/post/is-it-legal-to-scrape-amazon-unethical-uses-of-amazon-web-scraping
Is Amazon Scraping Legal?- A Primer on the Illegal and Unethical Uses of Amazon Web Scraping. Writer: Ashmi Subair. Ashmi Subair; Sep 29, 2023; 10 min read.

29. Amazon Joins Google's War Against Microsoft's Unethical Cloud ...
https://ctomagazine.com/unethical-cloud-computing/
24 Apr 2024 ... Amazon and Google have accused Microsoft of anti-competitive unethical cloud computing practices in a scathing letter to the CMA.

30. Poison Ivy 2: Unethical Consumption - Amazon UK
https://www.amazon.co.uk/Poison-Ivy-G-Willow-Wilson/dp/1779523300
Buy Poison Ivy 2: Unethical Consumption 1 by Wilson, G. Willow, Takara, Marcio, Ilhan, Atagun (ISBN: 9781779523303) from Amazon's Book Store.

31. The Ethics of Buying from Amazon - The Oxford Student
https://www.oxfordstudent.com/2020/11/07/the-ethics-of-buying-from-amazon/
7 Nov 2020 ... Image description: An Amazon warehouse. We have all heard horror stories of how warehouse employees are treated in Amazon – the insanely ...

32. 23rd February 2024: ICIJ - Amazon pays $1.9 million to migrant ...
https://andyjhall.org/2024/02/24/icij-feb-23-2024-amazon-pays-1-9-million-to-migrant-workers-in-saudi-arabia-harmed-by-labour-abuses-and-unethical-recruitment-practices/
24 Feb 2024 ... Systemic issue of migrant worker unethical and extortionate recruitment practices in Saudi Arabia, this never ends.

33. Complicit: How We Enable the Unethical and How to Stop
https://www.amazon.co.uk/Complicit-How-Enable-Unethical-Stop/dp/0691236542
Complicit: How We Enable the Unethical and How to Stop : Bazerman, Max H.: Amazon.co.uk: Books.

34. Handbook of Unethical Work Behavior: Implications for Individual ...
https://www.amazon.com/Handbook-Unethical-Work-Behavior-Implications/dp/076563256X
Handbook of Unethical Work Behavior: Implications for Individual Well-Being [Giacalone, Robert A, Promislo, Mark D] on Amazon.com.

35. Is Temu Ethical? The High Cost of The App's Too-Good Deals - Ethos
https://the-ethos.co/is-temu-ethical/
18 May 2025 ... But in a flash, Temu has grown into a real competitor for longer-standing giants in the space, like Amazon and Wish. While it does sell fast ...

36. Is Bribing For Amazon Product Reviews Illegal? - TraceFuse
https://tracefuse.ai/blog/is-it-illegal-for-sellers-to-bribe-you-for-amazon-product-reviews/
11 Dec 2024 ... Bribing users for positive reviews is a common practice that many unethical sellers use to boost their procut listings. Amazon can detect and ...

37. "Amazon - Unethical" Sticker for Sale by SSFootball - Redbubble
https://www.redbubble.com/i/sticker/Amazon-Unethical-by-SSFootball/47204330.EJUG5
Buy "Amazon - Unethical" by SSFootball as a Sticker. Amazon - Unethical.

38. US Department of Labor finds Amazon exposed workers to unsafe ...
https://www.dol.gov/newsroom/releases/osha/osha20230201-0
1 Feb 2023 ... At all six locations, OSHA investigators found Amazon exposed warehouse workers to a high risk of low back injuries and other musculoskeletal disorders.

39. Amazon Workers Plan Strike from Black Friday to Cyber Monday ...
https://tribune.com.pk/story/2512667/amazon-workers-plan-strike-from-black-friday-to-cyber-monday-over-labor-and-environmental-concerns
29 Nov 2024 ... This marks the fifth year of the Make Amazon Pay campaign, which seeks to hold Amazon accountable for what organizers call unethical business ...

40. Tax Avoidance as an Ethical Issue for Business
https://www.ibe.org.uk/resource/tax-avoidance-as-an-ethical-issue-for-business.html
... immoral' and unethical practice that undermines the integrity of the tax ... According to a report by the Guardian, Amazon generated sales of more than ...

41. Complicit: How We Enable the Unethical and How to Stop
https://www.amazon.co.uk/Complicit-How-Enable-Unethical-Stop/dp/0691236542
Complicit: How We Enable the Unethical and How to Stop : Bazerman, Max H.: Amazon.co.uk: Books.

42. Amazon Prime Ads Lawsuit: Company Files Motion to Dismiss Suit
https://variety.com/2024/digital/news/amazon-motion-dismiss-lawsuit-prime-video-ads-1236170304/
7 Oct 2024 ... ... Amazon offered an option for Prime Video users to watch ... Amazon's conduct, as alleged, “was immoral, unethical, oppressive, unscrupulous ...

43. FTC Sues Amazon for Illegally Maintaining Monopoly Power
https://www.ftc.gov/news-events/news/press-releases/2023/09/ftc-sues-amazon-illegally-maintaining-monopoly-power
26 Sept 2023 ... The Federal Trade Commission and 17 state attorneys general today sued Amazon.com, Inc. alleging that the online retail and technology company is a monopolist.

44. Amazon Legal Action: Recover Amazon frozen funds - Rosenblatt
https://www.rosenblatt-law.co.uk/amazon-seller-frozen-funds/
All too often Amazon's practice of freezing sellers' hard-earned funds is unfair and unethical. Now, sellers are joining forces to take legal action. If ...

45. Amazon Black Hat Tactics – How to Identify and Handle Them
https://www.sellerlogic.com/en/blog/amazon-black-hat-tactics/
18 Oct 2024 ... Black hat tactics refer to unethical or irregular practices that some sellers use to gain a fraudulent advantage on Amazon.

46. The culture of corruption across the Amazon Basin - Mongabay
https://news.mongabay.com/2025/02/the-culture-of-corruption-across-the-amazon-basin/
14 Feb 2025 ... ... unethical conduct. Too often, individuals who are fundamentally honest are induced to act unethically: they may be pressed for time ...

47. Amazon Alternatives - Ethical Revolution
https://ethicalrevolution.co.uk/amazon-alternatives/
... Amazon serves me everything on a single plate and delivers it for free the next day. It's such a shame that Amazon is an unethical giant. I need to find a ...

48. Unions demand Labor tackle “unethical” Amazon - The Australian
https://www.theaustralian.com.au/nation/unions-demand-labor-tackle-unethical-amazon/news-story/93eee1cc63a3273044cacee8b5b6143a
2 days ago ... The Commonwealth Procurement Rules require public funds are not used to support unethical or unsafe supplier practices, including tax avoidance ...

49. Amazon refuses 'unethical firings' allegation, calls resignations ...
https://www.livemint.com/companies/news/amazon-refuses-unethical-firings-allegation-calls-resignations-voluntary-11669350771123.html
25 Nov 2022 ... Amazon refuses 'unethical firings' allegation, calls resignations 'voluntary'. Amazon employs approximately 100,000 workers in the country.

50. Exposed: Amazon's enormous and rapidly growing plastic pollution ...
https://oceana.org/reports/amazon-report-2021/
Oceana analyzed e-commerce packaging data and found that Amazon generated 599 million pounds of plastic packaging waste in 2020. This is a 29% increase of ...


Please respond with the numbers of the 10 most relevent news articles to read for an investigation of the ethics of Amazon.
Please respond with only the numbers of the articles, in comma seperated sorted order eg. 1,2,3,4,5,6,7,8,9,10
`;

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
      const response = await llmFunc("What is nine plus ten? respond with just a number, eg. \"45\" or \"32\". Don't think about it too much"); // need to tell Qwen not to think too much
      expect(response).toBe("19");
    });
  
    it("can answer yes or no", async () => {
      const response = await llmFunc(
          "Is it generally correct to say sand tastes better than chocolate? " +
          "Please respond with only one of the following options and no other characters or punctuation: \"Yes\" or \"No\""
      )
      expect(response).toBe("No");
    });
  
    it("can select relevant search results from 10", async () => {
      // todo add more test cases
      const response = await llmFunc(investigationPrompt);
      expect(response).toMatch(/^(\d+)(, ?\d+){2}/);
      const nonRelevantArticles = [1, 2, 3, 4, 6, 8, 10];
      nonRelevantArticles.forEach( nonRelevantNumber =>
        expect(response).not.toContain(`${nonRelevantNumber}`)
      );
    });
  
    it("can select relevant search results from 50", async () => {
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
  
    it("can write a more detailed ethics summary", async () => {
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
  })
);
