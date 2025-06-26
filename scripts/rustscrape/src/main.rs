use std::error::Error;
use std::env;
use headless_chrome::{Browser, LaunchOptions};
use url::Url;

fn main() -> Result<(), Box<dyn Error>> {

    let arg = env::args().nth(1).expect("please provid URL as a command line arg");
    let url = Url::parse(&arg).expect("please provid URL as a command line arg");

    let browser_options = LaunchOptions {
        headless: true,
        ..Default::default()
    };
    let browser = Browser::new(browser_options)?;
    let user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
    let origin = format!("{}://{}/", url.scheme(), url.host_str().expect("please provid URL as a command line arg"));

    let mut tab = browser.new_tab()?;
    tab.set_user_agent(user_agent, None, None);
    tab.navigate_to(&origin)?;

    tab = browser.new_tab()?;
    tab.set_user_agent(user_agent, None, None);

    tab.navigate_to(url.as_str())?;

    if let Ok(main) = tab.wait_for_element("main") {
        println!("{}", main.get_inner_text()?); 
    }
    else if let Ok(body) = tab.wait_for_element("body") {
        println!("{}", body.get_inner_text()?); 
    }
    else {
        println!("Could not get main or body element from page to read text from")
    }

    Ok(())
}
