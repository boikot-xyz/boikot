import { searchEcosia } from './search.js';
import { scrapeViolationTrackers } from './violations.js';
import { scrapeEthicalOrg } from './ethical-org.js';

export async function getSources( companyName ) {
    const [wikiPage, unethicalResults, scandalResults, violationResults, ethicalOrgResults] = await Promise.all([
        searchEcosia( companyName + " wikipedia", 1 ),
        searchEcosia( companyName + " unethical" ),
        searchEcosia( companyName + " scandal" ),
        scrapeViolationTrackers( companyName ),
        scrapeEthicalOrg( companyName ),
    ]);

    return { wikiPage, unethicalResults, scandalResults, ...violationResults, ethicalOrgResults };
}
