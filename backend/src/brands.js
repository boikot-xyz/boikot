#!/usr/bin/env node

import { getWikipediaInfo } from "./wiki.js";
import slugify from "slugify";
import _ from "lodash";

const html = `

<ul><li>Brandmax<sup id="cite_ref-bmls_95-0" class="reference"><a href="#cite_note-bmls-95"><span class="cite-bracket">[</span>95<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Firetrap" title="Firetrap">Firetrap</a><sup id="cite_ref-FrasersBrands_96-0" class="reference"><a href="#cite_note-FrasersBrands-96"><span class="cite-bracket">[</span>96<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Flannels_(retail)" title="Flannels (retail)">Flannels</a> <sup id="cite_ref-97" class="reference"><a href="#cite_note-97"><span class="cite-bracket">[</span>note 1<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Game_(retailer)" title="Game (retailer)">Game</a> <sup id="cite_ref-98" class="reference"><a href="#cite_note-98"><span class="cite-bracket">[</span>note 2<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Gieves_%26_Hawkes" title="Gieves &amp; Hawkes">Gieves &amp; Hawkes</a></li>
<li><a href="/wiki/House_of_Fraser" title="House of Fraser">House of Frasers/Frasers</a> (flagship)<sup id="cite_ref-purchasebySportsDirect_64-1" class="reference"><a href="#cite_note-purchasebySportsDirect-64"><span class="cite-bracket">[</span>64<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Jack_Wills" title="Jack Wills">Jack Wills</a></li>
<li>Scotts</li>
<li>Sneakerboy Australia<sup id="cite_ref-sba_99-0" class="reference"><a href="#cite_note-sba-99"><span class="cite-bracket">[</span>97<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Sofa.com" title="Sofa.com">Sofa.com</a></li>
<li><a href="/wiki/Tessuti" title="Tessuti">Tessuti</a></li>
<li>Twin Sport</li>
<li><a href="/wiki/The_Webster" title="The Webster">The Webster</a></li></ul>
<div class="mw-heading mw-heading4"><h4 id="Sells_Sport/Exercise_Products"><span id="Sells_Sport.2FExercise_Products"></span>Sells Sport/Exercise Products</h4><span class="mw-editsection"><span class="mw-editsection-bracket">[</span><a href="/w/index.php?title=Frasers_Group&amp;action=edit&amp;section=12" title="Edit section: Sells Sport/Exercise Products"><span>edit</span></a><span class="mw-editsection-bracket">]</span></span></div>
<ul><li>EAG (Eybl &amp; Sports Experts)<sup id="cite_ref-101" class="reference"><a href="#cite_note-101"><span class="cite-bracket">[</span>note 3<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Evans_Cycles" title="Evans Cycles">Evans Cycles</a></li>
<li>Field &amp; Trek</li>
<li><a href="/wiki/Gelert_(company)" title="Gelert (company)">Gelert</a></li>
<li><a href="/wiki/Heatons" title="Heatons">Heatons</a></li>
<li>Sportland International Group <sup id="cite_ref-102" class="reference"><a href="#cite_note-102"><span class="cite-bracket">[</span>note 4<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Sports_Direct" title="Sports Direct">Sports Direct</a> (flagship) <sup id="cite_ref-104" class="reference"><a href="#cite_note-104"><span class="cite-bracket">[</span>note 5<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Sweatshop_(retailer)" title="Sweatshop (retailer)">Sweatshop</a></li>
<li>Tri UK</li>
<li><a href="/wiki/USC_(clothing_retailer)" title="USC (clothing retailer)">USC</a></li>
<li>WIT Fitness <sup id="cite_ref-106" class="reference"><a href="#cite_note-106"><span class="cite-bracket">[</span>note 6<span class="cite-bracket">]</span></a></sup></li></ul>
<div class="mw-heading mw-heading3"><h3 id="Online_Exclusive_brands">Online Exclusive brands</h3><span class="mw-editsection"><span class="mw-editsection-bracket">[</span><a href="/w/index.php?title=Frasers_Group&amp;action=edit&amp;section=13" title="Edit section: Online Exclusive brands"><span>edit</span></a><span class="mw-editsection-bracket">]</span></span></div>
<ul><li>Ace</li>
<li>Allsole</li>
<li><a href="/wiki/ASOS_(retailer)" title="ASOS (retailer)">ASOS</a> <sup id="cite_ref-107" class="reference"><a href="#cite_note-107"><span class="cite-bracket">[</span>note 7<span class="cite-bracket">]</span></a></sup><sup id="cite_ref-digitallook.com_108-0" class="reference"><a href="#cite_note-digitallook.com-108"><span class="cite-bracket">[</span>101<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Boohoo.com" class="mw-redirect" title="Boohoo.com">Boohoo.com</a> <sup id="cite_ref-109" class="reference"><a href="#cite_note-109"><span class="cite-bracket">[</span>note 8<span class="cite-bracket">]</span></a></sup><sup id="cite_ref-digitallook.com_108-1" class="reference"><a href="#cite_note-digitallook.com-108"><span class="cite-bracket">[</span>101<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Coggles" title="Coggles">Coggles</a><sup id="cite_ref-CoA_110-0" class="reference"><a href="#cite_note-CoA-110"><span class="cite-bracket">[</span>102<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Ebuyer" title="Ebuyer">Ebuyer</a></li>
<li>Getthelabel</li>
<li>My Bag<sup id="cite_ref-111" class="reference"><a href="#cite_note-111"><span class="cite-bracket">[</span>103<span class="cite-bracket">]</span></a></sup></li>
<li>ProBikeKit</li>
<li><a href="/wiki/Studio_Retail_Group" title="Studio Retail Group">Studio</a><sup id="cite_ref-112" class="reference"><a href="#cite_note-112"><span class="cite-bracket">[</span>104<span class="cite-bracket">]</span></a></sup><sup id="cite_ref-113" class="reference"><a href="#cite_note-113"><span class="cite-bracket">[</span>105<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Wiggle_Ltd" title="Wiggle Ltd">Wiggle</a></li></ul>
<div class="mw-heading mw-heading3"><h3 id="Electrical">Electrical</h3><span class="mw-editsection"><span class="mw-editsection-bracket">[</span><a href="/w/index.php?title=Frasers_Group&amp;action=edit&amp;section=14" title="Edit section: Electrical"><span>edit</span></a><span class="mw-editsection-bracket">]</span></span></div>
<ul><li><a href="/wiki/Currys_plc" title="Currys plc">Currys plc</a> <sup id="cite_ref-114" class="reference"><a href="#cite_note-114"><span class="cite-bracket">[</span>note 9<span class="cite-bracket">]</span></a></sup><sup id="cite_ref-115" class="reference"><a href="#cite_note-115"><span class="cite-bracket">[</span>106<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/AO_World" title="AO World">AO World</a> <sup id="cite_ref-116" class="reference"><a href="#cite_note-116"><span class="cite-bracket">[</span>note 10<span class="cite-bracket">]</span></a></sup><sup id="cite_ref-117" class="reference"><a href="#cite_note-117"><span class="cite-bracket">[</span>107<span class="cite-bracket">]</span></a></sup></li></ul>
<div class="mw-heading mw-heading3"><h3 id="Clothing_and_equipment">Clothing and equipment</h3><span class="mw-editsection"><span class="mw-editsection-bracket">[</span><a href="/w/index.php?title=Frasers_Group&amp;action=edit&amp;section=15" title="Edit section: Clothing and equipment"><span>edit</span></a><span class="mw-editsection-bracket">]</span></span></div>
<link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1184024115"><div class="div-col" style="column-width: 20em;">
<ul><li><a href="/wiki/Agent_Provocateur_(lingerie)" title="Agent Provocateur (lingerie)">Agent Provocateur</a> <sup id="cite_ref-118" class="reference"><a href="#cite_note-118"><span class="cite-bracket">[</span>note 11<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/British_Knights" title="British Knights">British Knights</a></li>
<li><a href="/wiki/Carlton_Sports" title="Carlton Sports">Carlton</a></li>
<li><a href="/wiki/Donnay_(sports)" class="mw-redirect" title="Donnay (sports)">Donnay</a></li>
<li><a href="/wiki/Everlast_(brand)" title="Everlast (brand)">Everlast</a></li>
<li><a href="/wiki/Firetrap" title="Firetrap">Firetrap</a></li>
<li><a href="/wiki/Gelert_(company)" title="Gelert (company)">Gelert</a></li>
<li>GoldDigga</li>
<li>Grumpytoly Apparel</li>
<li><a href="/wiki/Gul_(watersports)" title="Gul (watersports)">Gul</a></li>
<li><a href="/wiki/Hot_Tuna_Clothing" title="Hot Tuna Clothing">Hot Tuna</a></li>
<li><a href="/wiki/Kangol" title="Kangol">Kangol</a></li>
<li><a href="/wiki/Karrimor" title="Karrimor">Karrimor</a></li>
<li><a href="/wiki/LA_Gear" title="LA Gear">LA Gear</a></li>
<li><a href="/wiki/Lillywhites" title="Lillywhites">Lillywhites</a></li>
<li><a href="/wiki/Lonsdale_(clothing)" title="Lonsdale (clothing)">Lonsdale</a></li>
<li>Lovell Rugby</li>
<li>Lovell Rackets</li>
<li>Miso</li>
<li>Miss Fiori</li>
<li><a href="/wiki/Muddyfox" title="Muddyfox">Muddyfox</a></li>
<li><a href="/wiki/Mulberry_(company)" class="mw-redirect" title="Mulberry (company)">Mulberry</a> <sup id="cite_ref-120" class="reference"><a href="#cite_note-120"><span class="cite-bracket">[</span>note 12<span class="cite-bracket">]</span></a></sup></li>
<li>Nevica</li>
<li><a href="/wiki/No_Fear" title="No Fear">No Fear</a></li>
<li><a href="/wiki/Slazenger" title="Slazenger">Slazenger</a></li>
<li>Sondico</li>
<li>SoulCal</li>
<li>USA Pro</li></ul>
</div>
<div class="mw-heading mw-heading3"><h3 id="Former_brands">Former brands</h3><span class="mw-editsection"><span class="mw-editsection-bracket">[</span><a href="/w/index.php?title=Frasers_Group&amp;action=edit&amp;section=16" title="Edit section: Former brands"><span>edit</span></a><span class="mw-editsection-bracket">]</span></span></div>
<link rel="mw-deduplicated-inline-style" href="mw-data:TemplateStyles:r1184024115">
<div class="mw-heading mw-heading3"><h3 id="Defunct_and_inactive">Defunct and inactive</h3><span class="mw-editsection"><span class="mw-editsection-bracket">[</span><a href="/w/index.php?title=Frasers_Group&amp;action=edit&amp;section=17" title="Edit section: Defunct and inactive"><span>edit</span></a><span class="mw-editsection-bracket">]</span></span></div>
<ul><li>Dixon Sports Ltd <sup id="cite_ref-127" class="reference"><a href="#cite_note-127"><span class="cite-bracket">[</span>note 17<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Gamestation" title="Gamestation">Gamestation</a> <sup id="cite_ref-128" class="reference"><a href="#cite_note-128"><span class="cite-bracket">[</span>note 18<span class="cite-bracket">]</span></a></sup></li>
<li>Gilesports <sup id="cite_ref-129" class="reference"><a href="#cite_note-129"><span class="cite-bracket">[</span>note 19<span class="cite-bracket">]</span></a></sup></li>
<li>Hargreaves Sports <sup id="cite_ref-130" class="reference"><a href="#cite_note-130"><span class="cite-bracket">[</span>note 20<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/JJB_Sports" title="JJB Sports">JJB Sports</a> <sup id="cite_ref-131" class="reference"><a href="#cite_note-131"><span class="cite-bracket">[</span>note 21<span class="cite-bracket">]</span></a></sup></li>
<li>MegaValue.com <sup id="cite_ref-132" class="reference"><a href="#cite_note-132"><span class="cite-bracket">[</span>note 22<span class="cite-bracket">]</span></a></sup></li>
<li>PWP Sport <sup id="cite_ref-133" class="reference"><a href="#cite_note-133"><span class="cite-bracket">[</span>note 23<span class="cite-bracket">]</span></a></sup></li>
<li><a href="/wiki/Republic_(retailer)" title="Republic (retailer)">Republic</a> <sup id="cite_ref-134" class="reference"><a href="#cite_note-134"><span class="cite-bracket">[</span>note 24<span class="cite-bracket">]</span></a></sup></li>
<li>SheRunsHeRuns <sup id="cite_ref-135" class="reference"><a href="#cite_note-135"><span class="cite-bracket">[</span>note 25<span class="cite-bracket">]</span></a></sup></li>
<li>Sports Soccer <sup id="cite_ref-136" class="reference"><a href="#cite_note-136"><span class="cite-bracket">[</span>note 26<span class="cite-bracket">]</span></a></sup></li>
<li>Sports World <sup id="cite_ref-137" class="reference"><a href="#cite_note-137"><span class="cite-bracket">[</span>note 27<span class="cite-bracket">]</span></a></sup></li>
<li>Streetwise Sports <sup id="cite_ref-138" class="reference"><a href="#cite_note-138"><span class="cite-bracket">[</span>note 28<span class="cite-bracket">]</span></a></sup></li>
<li>MatchesFashion <sup id="cite_ref-139" class="reference"><a href="#cite_note-139"><span class="cite-bracket">[</span>note 29<span class="cite-bracket">]</span></a></sup></li></ul>
`;

const pages = _.uniqBy(
    [...html.matchAll(/<a.+?href="(.+?)".*?>(.+?)<\/a>/g)]
        .filter(m => !m[1].startsWith("#cite"))
        .filter(m => m[1].startsWith("/wiki"))
        .map(m => ["https://en.wikipedia.org"+m[1], m[2]]),
    m => m[0],
);

export const getKey = name => slugify(name).toLowerCase();
const entries = {};

for( const [url, name] of pages ) {
    console.log(name)
    const entry = {
        "names": [
            name,
        ],
        "comment": "",
        "sources": {},
        "sourceNotes": {},
        "tags": [
            "hospitality",
        ],
        "score": 14,
        "ownedBy": [
            "hilton"
        ],
        "updatedAt": "2026-02-05T06:28:22.531Z",
        ...(await getWikipediaInfo(name, url)),
    };
    entries[getKey(name)] = entry;
}

console.log(JSON.stringify(entries, null, 4));

