import { getWikipediaPage } from './wiki.js';

const brands = `
BAUR Versand
bonprix Handelsgesellschaft mbH
EOS Holding
Risk.Ident GmbH
Witt-Gruppe
Bonprix
Crate and Barrel
Heine
Küche & Co
Quelle
Sheego AG
Witt-Gruppe
Baur Group
FGH
Frankonia
Lascana
Limango
Manufactum
Otto Austria Group
Hermes
Otto Group one.O
Otto International
Risk Ident
EOS Group
Hanseatic Bank
Hanseatic Versicherungsdienst
BetterDoc
Headline
Medgate
Project A
Systain
`;


( async () => {
    for( const brand of brands.split("\n").filter(x => !!x) ) {
        console.log(brand);
        console.log( await getWikipediaPage(brand) );
        console.log("\n");
    }
} )()
