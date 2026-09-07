#!/usr/bin/env node

import { context } from 'fetch-h2';
import { URL } from 'node:url';

import { JSDOM } from "jsdom";
import { Cookie, CookieJar } from 'tough-cookie'
import esMain from 'es-main';


const resCookie = Cookie.parse(
    //`__cf_bm=9olW3io0S..TLwz3UW6_r7EEohvSLrQOZy8uTCZnXj4-1785180471.5497541-1.0.1.1-BWYAmOcoaumuWOf7yO4ntbKBFSpEYMSfV15kmzNRPqg3agPoHlOU7IGJuKOA02OpGL9UA47NVo7DUBDe73CHMCiO1cXMtt.n_Ygl6e_Vfk5gRh8dVY    NtHHED3AeQe3IP; cf_clearance=2vboI9q58rVGxZW8m3a8wA9.450uqD_LbNok43DQzxk-1785180471-1.2.1.1-ooTdPDodywpRdF.aTtCJzHWiLSYSqYK1yxRpBvxUjJlNkzNxDjZ9nsaC48HY6nFA0l5DT.GHSxAV4AaM8a0VIQZMVsEoruG34y.POVN79IBxEk93MtfN90MS    J3WlYFQGI00IEPqj3OWuIRorctQjbpdB_NCVPWY5RxHf7jkEf0HjDMi5_q3qmkFzZ3YtPkCnePLD3vqyUgvUDXD9g3Ogs533_AcFQ2rX53rMl4uoBl.0AZi.HkO8ftnCX.LdTx6cs5I2dcKA7aS3xoI9RO1M8_Bt8dRZ05xA1P7bCieakJKpIG9Wb9NNbz_yWgu86pXAurDa97fgH40p    Xm_GTSVzsbR7p8cC6oyab3jX2ZXW4Yi7RoP6DvxeNp6JxGwPwdLr1gVkX5q.O4uUJmOZcMt0ELZXwzhxObuPJkC6v4blDOWhh1CG0Es81_nnVb1USA2Mq60wbgzFAOtGgwK1D10VjFWKTmXd1WxaEoWB5PiBkhYmPb6xLW2p0dBP9Y9QX.pDwBOKNL6XIh0yxIsLtDpG.He91hap9d93    aXUptiIKiTAowtLtusrfZCZzEk2RmCoHwMBIy0chzdI7tVOEcbx3dQ`
    `ECUNL=74378426-33e9-4346-897d-98f0b60504e3; ECIE=%7B%22amount%22%3A3%2C%22updatedAt%22%3A%222026-08-31T10%3A08%3A20.987Z%22%2C%22isModified%22%3Afalse%7D; ECRC=nnnnoooooonononooonnnnoooonoon; ECFG=a=1:as=1:cs=0:dt=pc:f=y:fr=0:fs=1:l=en:lt=1788182066271:mc=en-gb:nf=1:nt=0:pz=0:t=111:tt=0:tu=auto:wu=auto:ma=1; _cfuvid=vM2yyzi01.EvxOQTDsZGvrv_eQdCG.dJZx91Ra1rM7s-1788170900.9597485-1.0.1.1-m39_pVECuhz7jcZXrAjIKp32Bvhoh2WSkwgAKjEHsNs; cf_clearance=_a5hcUuEoU.zgQ1JLR79t6RXRTnslfhs3djf7LDzElk-1788182187-1.2.1.1-e0…35-dc9e-42a0-afe7-a88335a378d4=g%3Ab9a5ccf3-5369-756b-808c-142775fa7ef9%7Ce%3Aundefined%7Cc%3A1787235795716%7Cl%3A1788182062964; ECAB=16; ECABN=0; euconsent-v2=CQpPqMAQpZjAAAHABBENCsFgAAAAAAAAAAYgAAAAAAEhgAMAAQZhEAAYAAgzCKAAwABBmEYABgACDMJAADAAEGYQkAEBeY6ACAvMlABAXmUgAgLz.IF5wAQF5gAAA; ECCC=e; ECABR=1; __cf_bm=KlHrLYoEQ3dCpL77bGc2t.jcYzWQlv6.2mHxE1Udpfo-1788182187.9572601-1.0.1.1-Km2WwD4hwEbQfitCf8DJ_iFbTCFo9P9CRp7Jnw_QQmFfEIkVdhZSlAJIzK_aX6x1ihTqJg5u6PJ5cZfHIHINRt0XWLgBGjEMRc_NSkj1yHrE4kwQhDpHoX4KGr5gybHr`
)
const cookieJar = new CookieJar() // uses the in-memory store by default
await cookieJar.setCookie(resCookie, 'https://ecosia.org/')
const { fetch } = context({ cookieJar: undefined });


export const fetchOptions = {
    "credentials": "omit",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:147.0) Gecko/20100101 Firefox/147.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-GB,en;q=0.9",
        "Sec-GPC": "1",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Priority": "u=0, i",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache",
    },
    "method": "GET",
    "mode": "cors"
};


async function scrapeResults( url ) {
    const pageHTML = await (await fetch(url, fetchOptions)).text();
    console.log(pageHTML)
    const pageDOM = new JSDOM( pageHTML );
    const document = pageDOM.window.document;

    const links = [...document.querySelectorAll(".result__title a.result__link")];
    const descriptions = [...document.querySelectorAll("div.result__description")];
    return links.map( (a,i) => ({
        source: "ecosia",
        title: a.textContent.trim(),
        url: a.href,
        description: descriptions[i].textContent.trim()
    }) );
}

export async function searchEcosia( searchQuery, pages=5 ) {
    return ( await Promise.all(
       ( new Array(pages) ).fill(0).map( (_,i) =>
            scrapeResults( `https://www.ecosia.org/search?q=${encodeURIComponent(searchQuery)}&p=${i}` )
        )
    ) ).flat();
}

( async () => {
    if(esMain(import.meta)) {
        const company = process.argv[2];
        if( !company )
            process.exit(
                console.log( "error: supply company name as argument!" )
            );

        const info = await searchEcosia( company + " unethical", 5 );

        console.log( info.map( ({title, url, description}, i) => `${i+1}. ` + title + "\n" + url + "\n" + description ).join("\n\n") );
    }
} )();

