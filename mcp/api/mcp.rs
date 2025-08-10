use rmcp::transport::streamable_http_server::{
    StreamableHttpService, session::local::LocalSessionManager, StreamableHttpServerConfig,
};
use vercel_runtime::{run, Body, Error, Request, Response};
use http_body_util::BodyExt;
use tower::util::ServiceExt;
use rmcp::{
    model::ErrorData as McpError,
    model::ErrorCode as McpErrorCode,
    RoleServer,
    ServerHandler,
    handler::server::{router::tool::ToolRouter, tool::Parameters},
    model::*,
    schemars,
    service::RequestContext,
    tool, tool_handler, tool_router,
};
use std::fs;


#[derive(Clone)]
pub struct BoikotMCPServerHandler {
    tool_router: ToolRouter<BoikotMCPServerHandler>,
}

#[derive(Debug, serde::Deserialize, schemars::JsonSchema)]
pub struct CopanyLookupParams {
    pub company_name: String,
}

#[tool_router]
impl BoikotMCPServerHandler {

    pub fn new() -> Self {
        Self {
            tool_router: Self::tool_router(),
        }
    }

    #[tool(description = "Lookup information about a company's ethics.")]
    async fn lookup_company_information(
        &self,
        Parameters(CopanyLookupParams { company_name }): Parameters<CopanyLookupParams>
    ) -> Result<CallToolResult, McpError> {

        println!("Looking up company data for query [{}]", company_name);

        let boikot_json = fs::read_to_string("boikot.json")
            .map_err(|_e| McpError::new(
                McpErrorCode::INTERNAL_ERROR,
                "Failed to read company database",
                None
            ))?;

        let boikot_data: serde_json::Value = serde_json::from_str(&boikot_json).expect("boikot.json is valid json");
        let companies = boikot_data.get("companies").expect("boikot.json has a .companies key");

        let companies_obj = companies.as_object().unwrap();
        let search_name = company_name.to_lowercase();

        for (company_id, company_data) in companies_obj {
            let names = company_data.get("names")
                .and_then(|n| n.as_array())
                .expect("each company has .names");

            let found_match = names
                .iter()
                .filter_map(|n| n.as_str())
                .any(|name| name.to_lowercase() == search_name);

            if !found_match {
                continue;
            }

            println!("Returning company data entry with id [{}] for query [{}]", company_id, company_name);

            return Ok(CallToolResult::success(vec![Content::text(
                company_data.to_string()
            )]))
        }

        println!("Found no company data for query [{}]", company_name);

        Ok(CallToolResult::error(vec![Content::text(
            format!("No entry in the company ethics dataset was found for {}", company_name),
        )]))
    }
}

#[tool_handler]
impl ServerHandler for BoikotMCPServerHandler {
    fn get_info(&self) -> ServerInfo {
        ServerInfo {
            protocol_version: ProtocolVersion::V_2024_11_05,
            capabilities: ServerCapabilities::builder()
                .enable_tools()
                .build(),
            server_info: Implementation::from_build_env(),
            instructions: Some(
                "This is the MCP server for boikot.xyz, which provides information about company ethics. Use the `lookup_company_information` tool to return a summary of a company's ethical track record.".to_string()
            ),
        }
    }

    async fn initialize(
        &self,
        _request: InitializeRequestParam,
        _context: RequestContext<RoleServer>,
    ) -> Result<InitializeResult, McpError> {

        Ok(self.get_info())
    }
}

pub async fn handler(req: Request) -> Result<Response<Body>, Error> {

    let service = StreamableHttpService::new(
        || Ok(BoikotMCPServerHandler::new()),
        LocalSessionManager::default().into(),
        StreamableHttpServerConfig {
            sse_keep_alive: None,
            stateful_mode: false,
        },
    );

    let response = service
        .oneshot(req)
        .await?;

    let (parts, body) = response.into_parts();
    let bytes = body.collect().await?.to_bytes();
    let vercel_body = Body::Binary(bytes.to_vec());

    Ok(Response::from_parts(parts, vercel_body))
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(handler).await
}
