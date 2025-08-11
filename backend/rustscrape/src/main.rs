use std::error::Error;
use std::env;
use headless_chrome::{Browser, LaunchOptions, Tab};
use headless_chrome::browser::tab::ModifierKey;
use url::Url;
use std::sync::Arc;
use std::time;
use reqwest::Client;
use pdf_extract::extract_text;
use std::io::Cursor;


fn open_url_in_tab(browser: &Browser, url: Url) -> Result<Arc<Tab>, String> {
    let user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
    //let user_agent = "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.6533.119 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
    let origin = format!("{}://{}/", url.scheme(), url.host_str().expect("please provid URL as a command line arg"));

    let mut tab = browser.new_tab().map_err(|_| "Could not open tab".to_string())?;
    tab.set_user_agent(user_agent, None, None);
    tab.navigate_to(&origin).map_err(|_| "Could not naviagate to origin".to_string())?;

    tab = browser.new_tab().map_err(|_| "Could not open tab".to_string())?;
    tab.set_default_timeout(time::Duration::from_secs(3));
    tab.set_user_agent(user_agent, None, None);

    tab.navigate_to(url.as_str()).map_err(|_| "Could not navigate to url".to_string())?;

    Ok(tab)
}

fn get_main_text(tab: &Tab) -> Result<String, String> {
    let main = tab.wait_for_element("main")
        .map_err(|_| "No main element found".to_string())?;
    
    let text = main.get_inner_text()
        .map_err(|e| e.to_string())?;

    if text.split_whitespace().count() < 20 {
        return Err("Could not extract text from main".to_string());
    }

    Ok(text)
}

fn get_body_text(tab: &Tab) -> Result<String, String> {
    let main = tab.wait_for_element("body")
        .map_err(|_| "No body element found".to_string())?;
    
    let text = main.get_inner_text()
        .map_err(|e| e.to_string())?;

    if text.split_whitespace().count() < 20  {
        return Err("Could not extract text from body".to_string());
    }

    Ok(text)
}

async fn get_pdf_text(url: Url) -> Result<String, String> {
    let client = Client::builder()
        .use_rustls_tls()
        .build().map_err(|_| "reqwest failed")?;
    let response = client
        .get(url)
        .header("Upgrade-Insecure-Requests", "1")
        .header("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36")
        .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7")
        .header("Sec-Fetch-Site", "none")
        .header("Sec-Fetch-Mode", "navigate")
        .header("Sec-Fetch-User", "?1")
        .header("Sec-Fetch-Dest", "document")
        .header("Accept-Language", "en-GB,en-US;q=0.9,en;q=0.8")
        .header("Priority", "u=0, i")
        .header("Accept-Encoding", "gzip, deflate, br")
        .send()
        .await.map_err(|_| "reqwest failed")?;
    
    // Check if the content type is PDF
    let content_type = response
        .headers()
        .get("content-type")
        .and_then(|ct| ct.to_str().ok())
        .unwrap_or("");
    
    if content_type.contains("application/pdf") {
        // Get the PDF bytes
        let pdf_bytes = response
            .bytes()
            .await
            .map_err(|_| "Failed to read response bytes")?;
        let text = pdf_extract::extract_text_from_mem(&pdf_bytes).map_err(|_| "Failed to extract text from PDF")?;
        
        Ok(text)
    } else {
        Err(format!("Content type is not PDF: {}", content_type))
    }
}

#[tokio::main]
async fn main() -> Result<(), String> {

    let arg = env::args().nth(1).expect("please provid URL as a command line arg");
    let url = Url::parse(&arg).expect("please provid URL as a command line arg");

    if let Ok(text) = get_pdf_text(url.clone()).await {
        println!( "{}", text );
        return Ok(());
    }

    let browser_options = LaunchOptions {
        headless: false,
        ..Default::default()
    };

    let browser = Browser::new(browser_options).map_err(|_| "Could not create browser".to_string())?;
    let tab = open_url_in_tab(&browser, url.clone())?;

    if let Ok(text) = get_main_text(&tab) {
        println!( "{}", text );
    }
    else if let Ok(text) = get_body_text(&tab) {
        println!( "{}", text );
    }
    else {
        return Err("Could not get main or body element from page to read text from".to_string());
    }

    Ok(())
}
