const puppeteer = require('puppeteer');
const request = require('request-promise-native');
const poll = require('promise-poller').default;
const fs = require('fs');

page = null;
const apiKey = 'de35911ed7bf1b4c601d2e78a3fc7b68';

async function startPuppeteer() {
	const browser = await puppeteer.launch({headless: false, slowMo: 100, defaultViewport: null, args: ['--start-maximized', '--window-size=1920,1080']});
	page = await browser.newPage();
	await page.setViewport({width: 1920,height: 1080,deviceScaleFactor: 1,});
	await page.goto('https://freebitco.in/?op=signup_page', { waitUntil: 'networkidle0' });
	console.log("Page Loaded");
	return browser;
}

async function logIn(username, password) {
	const selectorStr = 'body > div.large-12.fixed > div > nav > section > ul > li.login_menu_button > a';
	await page.$eval(selectorStr, elem => elem.click());
	await new Promise(r => setTimeout(r, 3000));

	console.log("Typing Username and password");
	await page.type('#login_form_btc_address', username);
	await page.type('#login_form_password', password);

	console.log("Submitting");
	await Promise.all([page.click('#login_button'), page.waitForNavigation()]);
	await new Promise(r => setTimeout(r, 10000));
}

async function exitAds() {
	try {
		const selectorStr = '#push_notification_modal > div.push_notification_big > div:nth-child(2) > div > div.pushpad_deny_button';
		await page.$eval(selectorStr, elem => elem.click());
		console.log("ad exited");
	}
	catch {console.log("no ad found");}
	
	console.log("waiting 20 secs");
	await new Promise(r => setTimeout(r, 20000));
	console.log("done waiting");
	const selectorStr = '#switch_captchas_button';
	await page.$eval(selectorStr, elem => elem.click());
	//page.click('#switch_captchas_button');
	await new Promise(r => setTimeout(r, 5000));
}

/*
async function initiateCaptchaRequest(src) {
	const formData = {
		key: apiKey,
		method: 'userrecaptcha',
		googlekey: '6LeGfGIUAAAAAEyUovGUehv82L-IdNRusaYFEm5b',
		pageurl: 'https://freebitco.in/?op=home',
		json: 1
	};
	console.log("Sending To 2captcha");
	const response = await request.post('https://2captcha.com/in.php', {form: formData});
	return JSON.parse(response).request;
}*/

//for images
async function initiateCaptchaRequest() {
	console.log("Initiating Captcha Request");
	const selectorStr = '#botdetect_free_play_captcha > div.captchasnet_captcha_content > img';
	let imageHref = await page.evaluate((sel) => {
        return document.querySelector(sel).getAttribute('src');
    }, selectorStr);
    var page2Url = "https:" + imageHref.slice(0,41) + "images/" + imageHref.slice(58,90) + ".jpeg";
    console.log(page2Url)
    /* Create an empty file where we can save data */
	let file = fs.createWriteStream(`file.jpg`);
	/* Using Promises so that we can use the ASYNC AWAIT syntax */        
	await new Promise((resolve, reject) => {
	    let stream = request({
	        /* Here you should specify the exact link to the file you are trying to download */
	        uri: page2Url,
	        headers: {
	            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
	            'Accept-Encoding': 'gzip, deflate, br',
	            'Accept-Language': 'en-US,en;q=0.9,fr;q=0.8,ro;q=0.7,ru;q=0.6,la;q=0.5,pt;q=0.4,de;q=0.3',
	            'Cache-Control': 'max-age=0',
	            'Connection': 'keep-alive',
	            'Upgrade-Insecure-Requests': '1'
	        },
	        /* GZIP true for most of the websites now, disable it if you don't need it */
	        gzip: true
	    })
	    .pipe(file)
	    .on('finish', () => {
	        console.log(`The file is finished downloading.`);
	        resolve();
	    })
	    .on('error', (error) => {
	        reject(error);
	    })
	})
	.catch(error => {
	    console.log(`Something happened: ${error}`);
	});
	console.log("waiting for 100 seconds");
	await new Promise(r => setTimeout(r, 100000));
	const formData = {
		key: apiKey,
		method: 'post',
		json: 1
	};
	const files = {
		file: file
	}
	console.log("Sending To 2captcha");
	const response = await request.post('https://2captcha.com/in.php', {form: formData});
	return JSON.parse(response).request;
}


async function pollForRequestResults(id, retries = 30, interval = 3000, delay = 20000) {
  console.log(`Polling for ${delay} milliseconds...`);
  await timeout(delay);
  return poll({
    taskFn: requestCaptchaResults(id),
    interval,
    retries
  });
}

function requestCaptchaResults(requestId) {
  const url = `https://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
  return async function() {
    return new Promise(async function(resolve, reject){
      console.log("polling for response...");
      const rawResponse = await request.get(url);
      const resp = JSON.parse(rawResponse);
      console.log(resp);
      if (resp.status === 0) return reject(resp.request);
      resolve(resp.request);
    });
  }
}

(async function main() {
  let browser = await startPuppeteer();
  await logIn('adaford@umich.edu', 'BPxNGtVkoRx7VinR');
  await exitAds();
  let id = await initiateCaptchaRequest();
  console.log(`http://2captcha.com/res.php?key=${apiKey}&action=get&id=${id}&json=1`);
  let result = await pollForRequestResults(id);
  console.log(result);
  await page.evaluate(`document.getElementById("g-recaptcha-response").innerHTML="${result}";`);
  await new Promise(r => setTimeout(r, 10000000));
  browser.close();

})()

const timeout = millis => new Promise(resolve => setTimeout(resolve, millis));
