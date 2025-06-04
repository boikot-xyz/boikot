import dotenv from "dotenv";

dotenv.config();

export async function askGroq( prompt, body ) {
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
                        "role": "user",
                        "content": prompt
                    }
                ],
                "model": "meta-llama/llama-4-maverick-17b-128e-instruct",
                "temperature": 1,
                "max_tokens": 1024,
                "top_p": 1,
                "stream": false,
                "stop": null,
                ...body,
            }),
        },
    ) ).json();
    // log response object for debugging
    //console.log(responseJSON)
    return responseJSON.choices[0].message.content;
}


export async function askQwen( prompt, body ) {
    const ollamaResponse = await fetch( 
        "http://localhost:11434/api/generate",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "qwen3:8b",
                stream: false,
                prompt: prompt,
                ...body,
            })
        }
    );
    return ( await ollamaResponse.json() ).response.replace(/<think>.*?<\/think>/gs, "").trim();
}
