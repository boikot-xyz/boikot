use rmcp::transport::streamable_http_server::{
    StreamableHttpService, session::local::LocalSessionManager, StreamableHttpServerConfig,
};
use vercel_runtime::{run, Body, Error, Request, Response};
use http_body_util::BodyExt;
use tower::util::ServiceExt;
use rmcp::{
    model::ErrorData as McpError,
    RoleServer,
    ServerHandler,
    handler::server::{router::tool::ToolRouter, tool::Parameters},
    model::*,
    schemars,
    service::RequestContext,
    tool, tool_handler, tool_router,
};

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

        Ok(CallToolResult::success(vec![Content::text(
            format!("company name {}", company_name),
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
