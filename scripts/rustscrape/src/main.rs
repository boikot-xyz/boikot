use std::error::Error;
use headless_chrome::Browser;
use headless_chrome::LaunchOptions;
use headless_chrome::protocol::cdp::Page;
use url::{Url, Host, Position};
use std::env;
use std::fs;
use std::iter::FusedIterator;

use ego_tree::iter::{Edge, Traverse};
use scraper::{Html, Selector, Node};
use scraper::element_ref::Text;


fn main() -> Result<(), Box<dyn Error>> {
    let browser_options = LaunchOptions {
        headless: true,
        ..Default::default()
    };
    let browser = Browser::new(browser_options)?;
    let user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
    let url = Url::parse("https://stackoverflow.com/questions/79646974/can-you-help-me-fix-those-errors-plz")?;
    let origin = format!("{}://{}/", url.scheme(), url.host_str().unwrap());

    let mut tab = browser.new_tab()?;
    tab.set_user_agent(user_agent, None, None);
    tab.navigate_to(&origin)?;

    tab = browser.new_tab()?;
    tab.set_user_agent(user_agent, None, None);

    tab.navigate_to(url.as_str())?;
    tab.wait_for_element("p")?;

    let html_content = tab.get_content()?;
    let main_p_selector = Selector::parse("main p").unwrap();
    let p_selector = Selector::parse("p").unwrap();
    let body_selector = Selector::parse("body").unwrap();

    let document = Html::parse_document(&html_content);

    let result: String = document
        .select(&body_selector)
        .next()
        .unwrap()
        .traverse()
        .filter_map(|edge| {
            if let Edge::Open(node) = edge {
                if let Some(text) = node.value().as_text() {
                    if let Some(parent_element) = node.parent().unwrap().value().as_element() {
                        if parent_element.name() == "script" 
                            || parent_element.name() == "style" 
                            || parent_element.name() == "noscript" {
                            return None;
                        }
                        return Some(text.text.to_string());
                    }
                }
            }
            None
        })
        .filter(|text| !text.trim().is_empty())
        .collect::<Vec<String>>()
        .join("");

    println!("{}", result);

    Ok(())
}
