
export function sortSources( summaryText, sources ) {
    const sourceMatches = summaryText.match(/\[(\d+)\]/g) ?? [];
    const sourceNumbers = sourceMatches.map( m => +m.match(/\d+/)[0] );

    const newSourceNumberMap = {};
    for( const sourceNumber of sourceNumbers )
        newSourceNumberMap[sourceNumber] =
            newSourceNumberMap[sourceNumber]
            || Object.keys(newSourceNumberMap).length + 1;

    const newSources = {};
    let newSummaryText = summaryText;
    for( const sourceNumber of sourceNumbers ) {
        newSummaryText = newSummaryText.replace(
            `[${sourceNumber}]`,
            `[%${newSourceNumberMap[sourceNumber]}]`
        );
        newSources[newSourceNumberMap[sourceNumber]] = sources[sourceNumber];
    }
    for( const sourceNumber of sourceNumbers )
        newSummaryText = newSummaryText.replace(
            `[%${newSourceNumberMap[sourceNumber]}]`,
            `[${newSourceNumberMap[sourceNumber]}]`
        );

    return [ newSummaryText, newSources ];
}

