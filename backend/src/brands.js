#!/usr/bin/env node

import { getWikipediaInfo } from "./wiki.js";
import slugify from "slugify";
import _ from "lodash";

const html = `


<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><li><a href="https://en.wikipedia.org/wiki/CocoaVia" title="CocoaVia">CocoaVia</a></li>
<li><a href="https://en.wikipedia.org/wiki/Foodspring" title="Foodspring">Foodspring</a></li></body></html>

<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><li>Abu Siouf</li>
<li><a href="https://en.wikipedia.org/wiki/Ben%27s_Original" title="Ben's Original">Ben's Original</a></li>
<li><a href="https://en.wikipedia.org/wiki/Dolmio" title="Dolmio">Dolmio</a></li>
<li>Ebly</li>
<li>Kan Tong</li>
<li><a href="https://en.wikipedia.org/wiki/MasterFoods" title="MasterFoods">MasterFoods</a></li>
<li><a href="https://de.wikipedia.org/wiki/Mir%C3%A1coli" class="extiw" title="de:Mirácoli">Mirácoli</a></li></body></html>

<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><li><a href="https://en.wikipedia.org/wiki/Seeds_of_Change_(company)" title="">Seeds of Change</a></li>
<li>Suzi Wan</li>
<li><a href="https://en.wikipedia.org/wiki/Tasty_Bite" title="Tasty Bite">Tasty Bite</a></li></body></html>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><a href="https://en.wikipedia.org/wiki/Mars_Petcare" class="mw-redirect" title="">Mars Petcare</a> </body></html>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><li><a href="https://en.wikipedia.org/wiki/Banfield_Pet_Hospital" title="Banfield Pet Hospital">Banfield Pet Hospital</a></li>
<li><a href="https://en.wikipedia.org/wiki/BluePearl_Specialty_and_Emergency_Pet_Hospital" title="BluePearl Specialty and Emergency Pet Hospital">BluePearl Specialty and Emergency Pet Hospital</a></li>
<li><a href="https://en.wikipedia.org/wiki/VCA_Animal_Hospitals" title="VCA Animal Hospitals">VCA Animal Hospitals</a></li></body></html>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><a href="https://en.wikipedia.org/wiki/AniCura" class="mw-redirect" title="AniCura">AniCura</a></body></html>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><li>Exelcat</li>
<li><a href="https://en.wikipedia.org/wiki/Eukanuba" title="Eukanuba">Eukanuba</a> (except in Europe)</li>
<li>Exelpet</li>
<li>Frolic</li>
<li><a href="https://en.wikipedia.org/wiki/The_Goodlife_Recipe" title="The Goodlife Recipe">The Goodlife Recipe</a></li>
<li>Good-o</li>
<li>Greenies</li>
<li><a href="https://en.wikipedia.org/wiki/Iams" title="Iams">Iams</a> (except in Europe)</li>
<li>James Wellbeloved</li>
<li>Kit-e-Kat</li>
<li>Max</li>
<li>My Dog</li>
<li>Natura</li>
<li><a href="https://en.wikipedia.org/wiki/Nutro_Products" title="Nutro Products">Nutro Products</a></li>
<li><a href="https://en.wikipedia.org/wiki/Pedigree_Petfoods" title="Pedigree Petfoods">Pedigree</a></li>
<li>Orijen</li>
<li>Optimum</li>
<li>Perfect Fit</li>
<li>Pill Pockets</li>
<li><a href="https://en.wikipedia.org/wiki/PrettyLitter" title="PrettyLitter">PrettyLitter</a><sup id="cite_ref-7" class="reference"><a href="https://en.wikipedia.org/wiki/List_of_Mars_Inc._brands#cite_note-7"><span class="cite-bracket">[</span>7<span class="cite-bracket">]</span></a></sup></li>
<li><a href="https://en.wikipedia.org/wiki/Royal_Canin" title="Royal Canin">Royal Canin</a></li>
<li>Schmackos</li>
<li><a href="https://en.wikipedia.org/wiki/Sheba_(cat_food)" title="Sheba (cat food)">Sheba</a></li>
<li>Spillers</li>
<li>Teasers</li>
<li>Techni-Cal</li>
<li>Temptations</li>
<li>Trill</li>
<li>Ultra</li>
<li><a href="https://en.wikipedia.org/wiki/Whiskas" title="Whiskas">Whiskas</a></li>
<li>Winergy</li></body></html>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><div class="mw-heading mw-heading3"><h3 id="Mars"></h3></div>
<div class="div-col">
<ul><li><a href="https://en.wikipedia.org/wiki/3_Musketeers_(chocolate_bar)" title="3 Musketeers (chocolate bar)">3 Musketeers</a></li>
<li>Amicelli</li>
<li>American Heritage Chocolate</li>
<li><a href="https://en.wikipedia.org/wiki/Balisto" title="Balisto">Balisto</a></li>
<li><a href="https://en.wikipedia.org/wiki/Bounty_(chocolate_bar)" title="Bounty (chocolate bar)">Bounty</a></li>
<li><a href="https://en.wikipedia.org/wiki/Celebrations_(confectionery)" title="Celebrations (confectionery)">Celebrations</a></li>
<li><a href="https://en.wikipedia.org/wiki/Cirku" class="mw-redirect" title="Cirku">Cirku</a></li>
<li><a href="https://en.wikipedia.org/wiki/CocoaVia" title="CocoaVia">CocoaVia</a></li>
<li><a href="https://en.wikipedia.org/wiki/Combos" title="Combos">Combos</a></li>
<li><a href="https://en.wikipedia.org/wiki/Dove_(chocolate_brand)" title="Dove (chocolate brand)">Dove</a></li>
<li><a href="https://en.wikipedia.org/wiki/Dove_Bar" title="Dove Bar">Dove Bar</a></li>
<li><a href="https://en.wikipedia.org/wiki/Ethel_M_Chocolate_Factory" class="mw-redirect" title="Ethel M Chocolate Factory">Ethel M Chocolates</a></li>
<li><a href="https://en.wikipedia.org/wiki/Flavia_Beverage_Systems" title="Flavia Beverage Systems">FLAVIA</a></li>
<li><a href="https://en.wikipedia.org/w/index.php?title=Fling_(candy)&amp;action=edit&amp;redlink=1" class="new" title="Fling (candy) (page does not exist)">Fling</a></li>
<li><a href="https://en.wikipedia.org/wiki/Flyte_(chocolate_bar)" title="Flyte (chocolate bar)">Flyte</a></li>
<li>Forever Yours</li>
<li><a href="https://en.wikipedia.org/wiki/Galaxy_(chocolate)" class="mw-redirect" title="Galaxy (chocolate)">Galaxy</a></li>
<li><a href="https://en.wikipedia.org/wiki/Galaxy_Bubbles" class="mw-redirect" title="Galaxy Bubbles">Galaxy Bubbles</a></li>
<li><a href="https://en.wikipedia.org/wiki/Galaxy_Honeycomb_Crisp" class="mw-redirect" title="Galaxy Honeycomb Crisp">Galaxy Honeycomb Crisp</a></li>
<li><a href="https://en.wikipedia.org/wiki/Galaxy_Minstrels" title="Galaxy Minstrels">Galaxy Minstrels</a></li>
<li><a href="https://en.wikipedia.org/w/index.php?title=GoodnessKNOWS&amp;action=edit&amp;redlink=1" class="new" title="GoodnessKNOWS (page does not exist)">goodnessKNOWS</a></li>
<li><a href="https://en.wikipedia.org/wiki/Kudos_(granola_bar)" title="Kudos (granola bar)">Kudos</a></li>
<li><a href="https://en.wikipedia.org/wiki/M-Azing" title="M-Azing">M-Azing</a></li>
<li><a href="https://en.wikipedia.org/wiki/M%26M%27s" title="M&amp;M's">M&amp;M's</a></li>
<li><a href="https://en.wikipedia.org/wiki/M%26M%27s_World" title="M&amp;M's World">M&amp;M's World</a></li>
<li><a href="https://en.wikipedia.org/wiki/Maltesers" title="Maltesers">Maltesers</a></li>
<li><a href="https://en.wikipedia.org/wiki/Curly_Wurly#U.S._Marathon" title="Curly Wurly">Marathon</a></li>
<li><a href="https://en.wikipedia.org/wiki/Mars_bar" title="Mars bar">Mars</a></li>
<li><a href="https://en.wikipedia.org/wiki/Milky_Way_(chocolate_bar)" title="Milky Way (chocolate bar)">Milky Way</a></li>
<li><a href="https://en.wikipedia.org/wiki/Munch_(candy_bar)" title="Munch (candy bar)">Munch</a></li>
<li>My M&amp;M's</li>
<li><a href="https://en.wikipedia.org/wiki/Promite" title="Promite">Promite</a></li>
<li><a href="https://en.wikipedia.org/wiki/Revels_(confectionery)" title="Revels (confectionery)">Revels</a></li>
<li><a href="https://en.wikipedia.org/wiki/Seeds_of_Change_(company)" title="Seeds of Change (company)">Seeds of Change</a></li>
<li><a href="https://en.wikipedia.org/wiki/Snickers" title="Snickers">Snickers</a></li>
<li><a href="https://en.wikipedia.org/wiki/Topic_(chocolate_bar)" title="Topic (chocolate bar)">Topic</a></li>
<li><a href="https://en.wikipedia.org/wiki/Tracker_(granola_bar)" title="Tracker (granola bar)">Tracker</a></li>
<li><a href="https://en.wikipedia.org/wiki/Treets" title="Treets">Treets</a></li>
<li><a href="https://en.wikipedia.org/w/index.php?title=Chocolates_Tur%C3%ADn_(Mexico)&amp;action=edit&amp;redlink=1" class="new" title="Chocolates Turín (Mexico) (page does not exist)">Chocolates Turín (Mexico)</a></li>
<li><a href="https://en.wikipedia.org/wiki/Twix" title="Twix">Twix</a></li></ul>
</div></body></html>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><li><a href="https://en.wikipedia.org/wiki/5_(gum)" title="5 (gum)">5 (gum)</a></li>
<li><a href="https://en.wikipedia.org/wiki/A._Korkunov" title="A. Korkunov">A. Korkunov</a></li>
<li><a href="https://en.wikipedia.org/wiki/Airwaves_(gum)" title="Airwaves (gum)">Airwaves</a></li>
<li><a href="https://en.wikipedia.org/wiki/Alert_(gum)" title="Alert (gum)">Alert</a></li>
<li>Alpine</li>
<li><a href="https://en.wikipedia.org/wiki/Altoids" title="Altoids">Altoids</a></li>
<li><a href="https://en.wikipedia.org/wiki/Big_Red_(gum)" title="Big Red (gum)">Big Red</a></li>
<li><a href="https://en.wikipedia.org/wiki/Bubble_Tape" title="Bubble Tape">Bubble Tape</a></li>
<li><a href="https://en.wikipedia.org/wiki/Callard_%26_Bowser-Suchard" title="Callard &amp; Bowser-Suchard">Callard &amp; Bowser-Suchard</a></li>
<li><a href="https://en.wikipedia.org/wiki/Doublemint" title="Doublemint">Doublemint</a></li>
<li><a href="https://en.wikipedia.org/wiki/Eclipse_(breath_freshener)" title="Eclipse (breath freshener)">Eclipse</a></li>
<li><a href="https://en.wikipedia.org/wiki/Eclipse_(breath_freshener)" title="Eclipse (breath freshener)">Eclipse Ice</a></li>
<li><a href="https://en.wikipedia.org/wiki/Excel_(gum)" class="mw-redirect" title="Excel (gum)">Excel</a></li>
<li><a href="https://en.wikipedia.org/wiki/Extra_(gum)" title="Extra (gum)">Extra</a></li>
<li><a href="https://en.wikipedia.org/wiki/Freedent" title="Freedent">Freedent</a></li>
<li><a href="https://en.wikipedia.org/wiki/Hubba_Bubba" title="Hubba Bubba">Hubba Bubba</a></li>
<li><a href="https://en.wikipedia.org/wiki/Juicy_Fruit" title="Juicy Fruit">Juicy Fruit</a></li>
<li><a href="https://en.wikipedia.org/wiki/Life_Savers" title="Life Savers">Life Savers</a></li>
<li><a href="https://en.wikipedia.org/wiki/Lockets" title="Lockets">Lockets</a></li>
<li><a href="https://en.wikipedia.org/wiki/Orbit_(gum)" title="Orbit (gum)">Orbit</a></li>
<li><a href="https://en.wikipedia.org/wiki/Ouch!_(gum)" title="Ouch! (gum)">Ouch!</a></li>
<li><a href="https://en.wikipedia.org/wiki/Skittles_(confectionery)" title="Skittles (confectionery)">Skittles</a></li>
<li><a href="https://en.wikipedia.org/wiki/Starburst_(candy)" title="Starburst (candy)">Starburst</a></li>
<li><a href="https://en.wikipedia.org/wiki/Sugus" title="Sugus">Sugus</a></li>
<li><a href="https://en.wikipedia.org/wiki/Surpass" title="Surpass">Surpass</a></li>
<li><a href="https://en.wikipedia.org/wiki/Rondo_(confectionery)" class="mw-redirect" title="Rondo (confectionery)">Rondo</a></li>
<li><a href="https://en.wikipedia.org/wiki/Tunes_(confectionery)" title="Tunes (confectionery)">Tunes</a></li>
<li><a href="https://en.wikipedia.org/wiki/Wrigley%27s" class="mw-redirect" title="Wrigley's">Wrigley's</a></li>
<li><a href="https://en.wikipedia.org/wiki/Wrigley%27s_Spearmint" title="Wrigley's Spearmint">Wrigley's Spearmint</a></li>

<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><table class="infobox hproduct ib-brand"><tbody><tr><th scope="row" class="infobox-label"></th><td class="infobox-data"><a href="https://en.wikipedia.org/wiki/Wrigley_Company" title="Wrigley Company">Wrigley Company</a></td></tr></tbody></table></body></html>
<li><a href="https://en.wikipedia.org/wiki/Winterfresh" title="Winterfresh">Winterfresh</a></li></body></html>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><div class="mw-heading mw-heading3"><h3 id="Kellanova"></h3></div>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body>of <a href="https://en.wikipedia.org/wiki/Kellanova" title="Kellanova">Kellanova</a>, </body></html>
<div class="div-col">
<ul><li><a href="https://en.wikipedia.org/wiki/All-Bran" title="All-Bran">All-Bran</a></li>
<li>Barras</li>
<li>Biscoito Integral</li>
<li><a href="https://en.wikipedia.org/wiki/Bran_Flakes" class="mw-redirect" title="Bran Flakes">Bran Flakes</a></li>
<li>Austin</li>
<li>Carr's</li>
<li><a href="https://en.wikipedia.org/wiki/Cheez-It" title="Cheez-It">Cheez-It</a></li>
<li><a href="https://en.wikipedia.org/wiki/Club_Crackers" title="Club Crackers">Club Crackers</a></li>
<li>Coco Pops</li>
<li><a href="https://en.wikipedia.org/wiki/Cocoa_Krispies" title="Cocoa Krispies">Cocoa Krispies</a></li>
<li><a href="https://en.wikipedia.org/wiki/Corn_Flakes" class="mw-redirect" title="Corn Flakes">Corn Flakes</a>
<ul><li>Bright Start</li></ul></li>
<li><a href="https://en.wikipedia.org/wiki/Crunchy_Nut" title="Crunchy Nut">Crunchy Nut</a></li>
<li><a href="https://en.wikipedia.org/wiki/Eggo" title="Eggo">Eggo</a></li>
<li><a href="https://en.wikipedia.org/wiki/Froot_Loops" title="Froot Loops">Froot Loops</a></li>
<li><a href="https://en.wikipedia.org/wiki/Frosted_Flakes" title="Frosted Flakes">Frosted Flakes</a>
<ul><li>Frosties</li>
<li>Zucaritas</li></ul></li>
<li>Fruit 'n Fibre</li>
<li>Grahams Crackers</li>
<li>Granola Integral</li>
<li><a href="https://en.wikipedia.org/w/index.php?title=Honey_Pops&amp;action=edit&amp;redlink=1" class="new" title="Honey Pops (page does not exist)">Honey Pops</a></li>
<li><a href="https://en.wikipedia.org/wiki/Honey_Smacks" title="Honey Smacks">Honey Smacks</a></li>
<li><a href="https://en.wikipedia.org/wiki/Kellogg%27s" title="Kellogg's">Kellogg's</a>
<ul><li>Kellogg's Chocos</li>
<li>Kellogg's Extra</li>
<li>Kellogg's Granola</li>
<li>Kellogg's Muesli</li></ul></li>
<li>Komplete</li>
<li>Krave</li>
<li>LCMs</li>
<li><a href="https://en.wikipedia.org/wiki/Morningstar_Farms" title="Morningstar Farms">Morningstar Farms</a></li>
<li>Müsli</li>
<li><a href="https://en.wikipedia.org/wiki/Nutri-Grain" title="Nutri-Grain">Nutri-Grain</a></li>
<li>Parati</li>
<li><a href="https://en.wikipedia.org/wiki/Pop-Tarts" title="Pop-Tarts">Pop-Tarts</a></li>
<li><a href="https://en.wikipedia.org/wiki/Pringles" title="Pringles">Pringles</a></li>
<li>Pure Organic</li>
<li><a href="https://en.wikipedia.org/wiki/Rice_Krispies" title="Rice Krispies">Rice Krispies</a>
<ul><li>Rice Bubbles</li>
<li><a href="https://en.wikipedia.org/wiki/Rice_Krispies_Treats" title="Rice Krispies Treats">Rice Krispies Treats</a></li>
<li>Rice Krispies Squares</li></ul></li>
<li><a href="https://en.wikipedia.org/wiki/Rxbar" title="Rxbar">Rxbar</a></li>
<li><a href="https://en.wikipedia.org/wiki/Special_K" title="Special K">Special K</a></li>
<li>Sucrilhos</li>
<li>Sultana Bran</li>
<li>Toasteds</li>
<li>Town House</li>
<li>Trésor</li>
<li>Wheats</li>
<li>Zesta</li>
<li>Zimmy's Cinnamon Stars</li></ul>
</div></body></html>
<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><li><a href="https://en.wikipedia.org/wiki/Hotel_Chocolat" title="Hotel Chocolat">Hotel Chocolat</a></li>
<li><a href="https://en.wikipedia.org/wiki/Kind_(company)" title="Kind (company)">KIND</a></li>
<li>Tru Fru</li></body></html>


`;

const tags = [
    "food",
];
const score = 17;
const ownedBy = "mars";

const pages = _.uniqBy(
    [...html.matchAll(/<a.+?href="(.+?)".*?>(.+?)<\/a>/g)]
        .filter(m => !m[1].includes("#cite"))
        .filter(m => m[1].includes("/wiki"))
        .map(m => [m[1], m[2]]),
    m => m[0],
);
console.log(pages);

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
        "tags": tags,
        "score": score,
        "ownedBy": [
            ownedBy,
        ],
        "updatedAt": (new Date()).toISOString(),
        ...(await getWikipediaInfo(name, url)),
    };
    entries[getKey(name)] = entry;
}

console.log(JSON.stringify(entries, null, 4));

