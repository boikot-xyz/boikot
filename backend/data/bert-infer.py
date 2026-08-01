#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
from pathlib import Path
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np

# --------------------------------------------------------------------------- #
# 1️⃣  Load the tokenizer & model
# --------------------------------------------------------------------------- #
MODEL_DIR = Path("./distilbert_headlines_classifier2")

# The tokenizer is automatically picked up from the directory
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)

# The same directory contains the DistilBERT model + head
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)

# --------------------------------------------------------------------------- #
# 2️⃣  Send everything to the best available device (GPU → CPU fallback)
# --------------------------------------------------------------------------- #
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()          # Disable dropout, etc.

# --------------------------------------------------------------------------- #
# 3️⃣  Helper: predict a single headline
# --------------------------------------------------------------------------- #
def predict(text: str) -> tuple[int, float]:
    """
    Returns (predicted_label, confidence_score)
    """
    # 3a. Tokenise – do *not* pad because we only have one sample
    inputs = tokenizer(
        text,
        return_tensors="pt",
        truncation=True,
        max_length=64,
    ).to(device)

    # 3b. Forward pass (no grad for inference)
    with torch.no_grad():
        logits = model(**inputs).logits

    # 3c. Convert to probabilities
    probs = torch.nn.functional.softmax(logits, dim=-1).cpu().numpy()[0]

    # 3d. Pick the class with the highest probability
    label = int(np.argmax(probs))
    confidence = float(probs[label])

    return label, confidence


headlines = (
"""Brent Crude Oil Minus −0.49%
What is the latest news on the UK economy?
Western support for Ukraine
How will the UK economy fare in 2024?
Middle East & North Africa
Russia sues Euroclear over frozen assets
A Brexit survival strategy that shows Starmer’s days are numbered
Apollo moves fast-growing lending unit out of buyout division
UK economy contracts by 0.1% in October 
A Brexit survival strategy that shows Starmer’s days are numbered
UK economy contracts by 0.1% in October 
The UK economy is not nearly as bad as you’ve been told
MPs’ pension scheme makes ‘mockery’ of Reeves investment push
Postcard from London: ‘The city is magical at Christmas — don’t leave it to us tourists’
HSBC axes 160-year-old management scheme in bid to cut costs
Russia sues Euroclear over frozen assets
Apollo moves fast-growing lending unit out of buyout division
Marsalek’s missing millions: the unravelling of a secret Libyan empire
MPs’ pension scheme makes ‘mockery’ of Reeves investment push
Get ready for a spectacular IPO boom from the big beasts of Silicon Valley
Oracle shares sink as worries swirl over huge spending on data centres
FT Person of the Year: Jensen Huang
The mind-bending complexities of quantum investing
Europe must be ready when the AI bubble bursts
Russia sues Euroclear over frozen assets
Crypto entrepreneur Do Kwon sentenced to 15 years in prison
MPs’ pension scheme makes ‘mockery’ of Reeves investment push
Get ready for a spectacular IPO boom from the big beasts of Silicon Valley
A Brexit survival strategy that shows Starmer’s days are numbered
The UK economy is not nearly as bad as you’ve been told
Get ready for a spectacular IPO boom from the big beasts of Silicon Valley
Europe must be ready when the AI bubble bursts
Former ANZ chief sues over axed $9mn bonus
The economics of seasonal serenity
The perils of using AI when recruiting
Danny Meyer shows us his Union Square
Reeves warns of lost opportunities if UK’s female founders are overlooked
Postcard from London: ‘The city is magical at Christmas — don’t leave it to us tourists’
‘Hollywood is shocked’: Warner Bros sale looms large over movie industry
Charity starts with a slogan shirt
Warner battle offers two different plotlines for Hollywood
Fackham Hall — period drama parody is perfect for panto season
What is the latest news on the UK economy?
Western support for Ukraine
How will the UK economy fare in 2024?
Russia sues Euroclear over frozen assets
Legal challenge is first shot across the bows as Brussels aims to use funds for €90bn loan to Ukraine
Ukraine would join EU next year under draft peace plan
FT Person of the Year: Jensen Huang
opinion content. The UK economy is not nearly as bad as you’ve been told
opinion content. The Trump administration’s challenge is Trump
US stocks fall from record as Broadcom tumbles 
Sharp drop for chipmaker underlines investor nerves over AI valuations
UK economy contracts by 0.1% in October 
Analysts and ONS cite uncertainty ahead of Rachel Reeves’ tax-raising Budget
HSBC axes 160-year-old management scheme in bid to cut costs
‘International Manager’ programme closed to new recruits as CEO Georges Elhedery reshapes Europe’s largest lender
Former ANZ chief sues over axed $9mn bonus
MPs’ pension scheme makes ‘mockery’ of Reeves investment push
Fund has lower than average weighting to UK stock market 
Monetary Policy Radar – Special Edition
When the Fed moves, markets react
Anticipate September's announcement with Monetary Policy Radar
Monetary Policy Radar – Exclusive Insights Into Central Bank Policy
Analysts’ Views: expectations for December’s meetings firm but 2026 will bring uncertainty
Fed delivers rate cut with hawkish guidance 
Lunch with the FT. Architect Diébédo Francis Kéré: ‘My life is serendipity’
The Pritzker-winner on building ‘from the earth’, why modern architecture is going too fast — and how it all began with wobbly school benches
The Big Read. Why Europeans need to learn more about money
In many countries, financial knowledge is poor and savings are held in low-return products, slowing the continent’s economy
‘JPMorgan has crossed a line’: How Altice’s debts ensnared US banking giant
US bank stepped into messy confrontation between billionaire Patrick Drahi and aggrieved Wall Street funds
Marsalek’s missing millions: the unravelling of a secret Libyan empire
FT investigation sheds light on Wirecard fraudster’s activities in north Africa and shadow life as a Russian agent of influence 
Gatwick airport blames Budget as it raises drop-off charges by 40%
Chief executive says higher business rates worry investors as they prepare to sign off on £2.2bn expansion
EU plans special parking rights for ‘Made in Europe’ small cars
HSBC axes 160-year-old management scheme in bid to cut costs
opinion content. A Brexit survival strategy that shows Starmer’s days are numbered
Russia sues Euroclear over frozen assets
opinion content. Is silver the new gold?
Marsalek’s missing millions: the unravelling of a secret Libyan empire
Warner Bros Discovery, Inc
Rivals eye options as bidding war for Warner Bros escalates
Pressure mounts for Netflix and Paramount as hostile battle could push deal price higher than expected  
Top Fed officials warn central bank must not be complacent on inflation
Kansas City’s Jeff Schmid says long-term borrowing costs will rise if policymakers lose their ‘credibility’
WHSmith delays results again to give auditor PwC more time
Retailer has been hit by accounting errors that led to resignation of chief executive last month
Coty chair to leave as owner JAB plans leadership shake-up
CEO Sue Nabi set to depart after beauty group’s chair Peter Harf steps down in major overhaul 
FT Alphaville. Inside the ‘rolling thunder’ quant crises of 2025
It’s been quite the year for systematic investors
Trump’s DR Congo-Rwanda peace deal unravels as rebels take new territory
A fresh offensive has cast doubt on the durability of accords signed last week in Washington
Why Maga hates Europe: Trump takes the culture wars across the Atlantic
US president’s attacks on America’s allies extend his campaign to dismantle the pillars of liberal power
Schneider pushes regional shift as data centre boom lifts outlook
French energy tech specialist is growing in China and the US and building up local supply chains
opinion content. Is silver the new gold?
The surge in the precious metal’s price could have ominous implications for the markets
opinion content. Get ready for a spectacular IPO boom from the big beasts of Silicon Valley
SpaceX, OpenAI and Anthropic will break new ground — potentially with the scale of their losses
opinion content. The FT View. Warner battle offers two different plotlines for Hollywood
opinion content. It’s time to restore the civic function of US universities
opinion content. Europe must be ready when the AI bubble bursts
opinion content. Markets Insight. The whale oil lesson markets shouldn’t ignore
opinion content. The mind-bending complexities of quantum investing
opinion content. Lex. L’Oréal shows building stakes in a rival might just be worth it
Free school projects in England to be scrapped to fund special needs education
Government changes lay groundwork for contentious reforms expected next year
UK asylum appeals backlog jumps 37% over a six-month period 
UK bankers warn on plan to use Russian assets for loans to Ukraine
NHS warns of ‘worst-case scenario’ as flu cases in hospitals soar
Nationwide fined £44mn over failings that led to fake Covid furlough payouts
Boom at the inns: UK pub groups raise a glass to festive cheer
Why local constabularies are under threat from Labour’s policing overhaul
Inside PoliticsSign up for our newsletter
FT News Briefing. Disney and OpenAI team up 
Political Fix. Political Fix Live: Labour's year in review 
Unhedged Podcast. Can 2026 match 2025?
Rachman Review. Europe’s rocky relations with Donald Trump
FT Magazine. The Serbian mining town where copper is everything
Review. Into the Woods — a five-star revival of Sondheim’s fairy-tale mash-up at the Bridge
Review. On Friendship — Andrew O’Hagan sorts through the Old Friends cupboard
opinion content. Plants are for life — not just for Christmas
Review. Matthew Bourne’s gorgeously staged The Red Shoes returns
video content. The Wolf-Krugman Exchange: America vs the world
Fukushima nuclear accident
video content. In Fukushima's shadow: Japan's pivot back to nuclear | FT Film 
opinion content. The Wolf-Krugman Exchange: Maga man and Mamdani
video content. The CEO Crisis: how to survive the pressure | FT Working It 
UBS shares hit 17-year high on hopes of watered down capital reforms
Investor optimism has been fuelled by a compromise proposed by Swiss political parties
Nationwide fined £44mn over failings that led to fake Covid furlough payouts
Apollo moves fast-growing lending unit out of buyout division
The data breach that hit two-thirds of a country
Lululemon shares jump after chief Calvin McDonald announces departure
‘Hollywood is shocked’: Warner Bros sale looms large over movie industry
Natixis and Generali end talks over asset management tie-up
Emerging market private credit surges to record $18bn
Lending booms in developing economies even as US industry struggles following collapse of First Brands
Silver surges above $60 for first time on global supply squeeze
Oil market faces ‘super glut’ as supply surge hits prices
Ukraine strikes deal to restructure $2.6bn of growth-linked debt
BoJ governor says economy has weathered Trump’s tariffs 
Investors increase bets on ECB rate rise in threat to dollar 
Boaz Weinstein’s $2bn flagship hedge fund sinks amid buoyant markets
FT Swamp Notes. Big tech’s ‘elite victim complex’
Acolytes of the broligarchs have a grip on key nodes of Washington’s power ministries
FT Books Essay. Screen grab: can books win the battle for children’s attention? 
audio content. FT News Briefing. Disney and OpenAI team up 
The data breach that hit two-thirds of a country
India Business Briefing. Microsoft and Amazon’s multibillion-dollar bets on India
Trump threatens federal funding cuts for states with ‘onerous’ AI laws 
S&P 500 closes at record high as consumer-led rally blunts Oracle slide
Explore more events from the FT
The Central & Eastern European Forum
Business of Football Summit
Slavery Statement & Policies
Professional Subscriptions
FT Editorial Code of Practice
Middle East & North Africa
Visual and data journalism"""
).split("\n")

for s in headlines:
    lbl, conf = predict(s)
    if lbl == 1 and conf > 0.7:
        print(s, conf)

"""
s = sys.stdin.read().strip()
lbl, conf = predict(s)
print(lbl, conf)
"""
