import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
    "Get information about a company's ethics.",
    {
        companyName: z.string().describe("Commonly used name for a company eg. Apple, Samsung"),
    },
    async ({ companyName }) => {
        return { content: [ { type: "text", text: JSON.stringify(lookupCompany(companyName) || "Did not find information about " + companyName, null, 4) } ] };
    },
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Boikot MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
