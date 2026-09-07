#!/usr/bin/env node

import dotenv from "dotenv";
import { Agent } from "undici";


dotenv.config();

export async function askLlama4( prompt, body ) {
    const responseJSON = await ( await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are an investigative journalist looking into the ethical track record of various companies. " +
                            "You rigourously gather articles about unethical actions by companies and publish information " +
                            "on them online in a format easily understood by the public."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt
                    },
                ],
                "model": "meta-llama/llama-4-maverick-17b-128e-instruct",
                //"model": "meta-llama/llama-4-scout-17b-16e-instruct",
                "temperature": 0,
                "max_tokens": 1024,
                "top_p": 1,
                "stream": false,
                "stop": null,
                ...body,
            }),
        },
    ) ).json();

    if( !responseJSON.choices ) {
        // log response object for debugging
        console.log(responseJSON);
        if( responseJSON.error.code === "rate_limit_exceeded" ) {
            const wait =
                +(responseJSON.error?.message
                    .match(/try again in ([\d.]+)s/)?.[1]) 
                || 5;
            await new Promise( resolve => setTimeout(resolve, wait * 1000 + 10 ) );
            // retry after delay
            return await askLlama4( prompt, body );
        }
    }

    return responseJSON.choices[0].message.content;
}


export async function askQwen( prompt, body ) {
    const ollamaResponse = await (await fetch( 
        "http://localhost:11434/api/chat",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "qwen3:8b",
                stream: false,
                messages: [
                    {
                        "role": "system",
                        "content": (
                            "You are an investigative journalist looking into the ethical track record of various companies. " +
                            "You rigourously gather articles about unethical actions by companies and publish information " +
                            "on them online in a format easily understood by the public."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt
                    },
                ],
                ...body,
            })
        }
    )).json();

    if( !ollamaResponse.message.content )
        console.log( ollamaResponse );

    return ollamaResponse.message.content.replace(/<think>.*?<\/think>/gs, "").trim();
}


export async function askGemma( prompt, body ) {
    const ollamaResponse = await (await fetch( 
        "http://localhost:11434/api/chat",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gemma3:4b",
                stream: false,
                messages: [
                    {
                        "role": "system",
                        "content": (
                            "You are an investigative journalist looking into the ethical track record of various companies. " +
                            "You rigourously gather articles about unethical actions by companies and publish information " +
                            "on them online in a format easily understood by the public."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt
                    },
                ],
                ...body,
            })
        }
    )).json();

    if( !ollamaResponse.message.content )
        console.log( ollamaResponse );

    return ollamaResponse.message.content.replace(/<think>.*?<\/think>/gs, "").trim();
}

export async function askGPTOSS( prompt, body ) {
    const responseJSON = await ( await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are an investigative journalist looking into the ethical track record of various companies. " +
                            "You rigourously gather articles about unethical actions by companies and publish information " +
                            "on them online in a format easily understood by the public."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt
                    },
                ],
                "model": "openai/gpt-oss-120b",
                "temperature": 0,
                "max_tokens": 1024,
                "top_p": 1,
                "stream": false,
                "stop": null,
                ...body,
            }),
        },
    ) ).json();

    if( !responseJSON.choices ) {
        // log response object for debugging
        console.log(responseJSON);
        if( responseJSON.error.code === "rate_limit_exceeded" ) {
            const wait =
                +(responseJSON.error?.message
                    .match(/try again in ([\d.]+)s/)?.[1]) 
                || 5;
            await new Promise( resolve => setTimeout(resolve, wait * 1000 + 10 ) );
            // retry after delay
            return await askGPTOSS( prompt, body );
        }
    }

    return responseJSON.choices[0].message.content;
}


export async function askLocalGPTOSS( prompt, body ) {
    const responseJSON = await ( await fetch(
        "http://localhost:11434/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "You are an investigative journalist looking into the ethical track record of various companies. " +
                            "You rigourously gather articles about unethical actions by companies and publish information " +
                            "on them online in a format easily understood by the public."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt
                    },
                ],
                "model": "gpt-oss:latest",
                "temperature": 0,
                "max_tokens": 8192,
                "top_p": 1,
                "stream": false,
                "stop": null,
                ...body,
            }),
        },
    ) ).json();
    console.log(JSON.stringify(responseJSON, null, 4));
    return responseJSON.choices[0].message.content;
}


const defaultSystemPrompt = (
    "You are an investigative journalist looking into the ethical track record of various companies. " +
    "You rigourously gather articles about unethical actions by companies and publish information " +
    "on them online in a format easily understood by the public."
);
export async function askLocal( prompt, { body = {}, model = "gemma4:26b", systemPrompt = defaultSystemPrompt } ) {
    const responseJSON = await ( await fetch(
        "http://localhost:11434/v1/chat/completions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "messages": [
                    //{
                    //    "role": "system",
                    //    "content": systemPrompt,
                    //},
                    {
                        "role": "user",
                        "content": prompt
                    },
                ],
                "model": model,
                "temperature": 1.0,
                "max_tokens": 8192,
                "top_p": 0.95,
                "top_k": 64,
                "stream": false,
                "stop": null,
                ...body,
            }),
            signal: AbortSignal.timeout(999 * 1000),
        },
    ) ).json();
    console.log(JSON.stringify(responseJSON, null, 4));
    return responseJSON.choices[0].message.content;
}


export async function embed( prompt, body={} ) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "input": prompt,
            "model": "embeddinggemma:latest",
            ...body,
        }),
    };
    const response = await fetch('http://localhost:11434/api/embed', options);

    return (await response.json()).embeddings[0];
}

