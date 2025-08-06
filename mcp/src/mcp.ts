import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import boikot from "../../boikot.json" with { type: 'json' };

const cleanName = (name: string) => name.toLowerCase().replace(/[^ 0-9a-z]/g, '');

function lookupCompany(companyName: string): any {
    return Object.entries(boikot.companies)
        .map(([key, company]) => company)
        .find(company =>
            company.names.map(cleanName).includes(cleanName(companyName))
        );
}

const server = new McpServer({
    name: "boikot-mcp",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});

server.tool(
    "get-company-info",
    "Get information about a company's ethics and boycott status.",
    {
        companyName: z.string().describe("Commonly used name for a company eg. Apple, Samsung"),
    },
    async ({ companyName }) => {
        const company = lookupCompany(companyName);
        const text = company ? JSON.stringify(company, null, 2) : `No information found for company: ${companyName}`;
        return {
            content: [{
                type: "text",
                text,
            }]
        };
    },
);

async function main() {
    const port = parseInt(process.env.PORT || "3000");
    
    const transport = new SSEServerTransport("/message", {
        port: port,
    });
    
    await server.connect(transport);
    console.log(`Boikot MCP Server running on port ${port}`);
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
