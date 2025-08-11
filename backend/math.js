
export const dist = (a, b) =>
    Math.sqrt( a.reduce(
        (sum, _, i) => sum + ( a[i] - b[i] ) ** 2, 0
    ) );

export const length = a =>
    Math.sqrt( a.reduce(
        (sum, val) => sum + val ** 2, 0
    ) );

export const cosineSimilarity = (a, b) =>
    a.reduce(
        (sum, _, i) => sum + ( a[i] * b[i] ), 0
    ) / ( length(a) * length(b) );
