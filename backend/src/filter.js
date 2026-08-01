import { embed } from "./llm.js";
import { dist, cosineSimilarity } from "./math.js";

async function minBy( array, func ) {
    let [ result, resultFuncValue ] = [ null, Number.MAX_VALUE ];
    for( const item of array ) {
        const itemFuncValue = await func(item);
        if( itemFuncValue < resultFuncValue )
            [ result, resultFuncValue ] = [ item, itemFuncValue ];
    }
    return result;
}

export async function closestEmbedding( results, targetResult ) {
    const targetEmbedding = await embed( targetResult );
    return minBy(
        results,
        async result => {
            const d = dist( targetEmbedding, await embed( result ) );
            console.log( d, result.slice(0,40) );
            return d;
        }
    );
}

export async function mostAlignedEmbedding( results, targetResult ) {
    const targetEmbedding = await embed( targetResult );
    return minBy(
        results,
        async result => {
            const d = -cosineSimilarity( targetEmbedding, await embed( result ) );
            console.log( d, result.slice(0,40) );
            return d;
        }
    );
}
