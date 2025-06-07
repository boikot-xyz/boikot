
export const dist = (a, b) =>
    Math.sqrt( a.reduce(
        (sum, _, i) => sum + ( a[i] - b[i] ) ** 2, 0
    ) );
