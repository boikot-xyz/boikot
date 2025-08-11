import { dirname } from 'path';
import { exec, execSync } from 'node:child_process';


export async function rustscrape( url ) {
    return new Promise( (resolve, reject) => 
        exec(
            `cargo run ${url}`,
            { cwd: dirname(new URL(import.meta.url).pathname) },
            (error, stdout, stderr) => {
                if( error ) reject(error);
                resolve(stdout);
            }
        )
    );
}

