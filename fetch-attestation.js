import 'dotenv/config'
import fs from 'fs'
import path from 'path'

const outputDirectory = 'output'
const screenShotDirectory = outputDirectory + '/screenshots'

fs.mkdirSync(screenShotDirectory, { recursive: true }); // <-- make sure folders exist

import { getValidationCode } from './fetch-authentification-code.js';

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
import puppeteer from 'puppeteer-extra';

// add stealth plugin and use defaults (all evasion techniques)
// We don't want to be caught by the civil guard of the bots :P
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin())

// puppeteer usage as normal
puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }).then(async browser => {

    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 800 });

    await simulateFrenchBrowser(page);

    const downloadPath = `./${outputDirectory}`;

    await page._client().send('Page.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath: downloadPath,
    });

    console.log('[INFO] Go on the IDF Website page..')

    // delay function that simulate random delay betwenn two values
    const delay = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    await page.goto('https://www.iledefrance-mobilites.fr/')
    await new Promise(resolve => setTimeout(resolve, delay(500, 1000)));

    await page.waitForSelector('.banner-button-accept', { visible: true });
    await page.click('.banner-button-accept');

    await page.goto('https://mon-espace.iledefrance-mobilites.fr')
    await new Promise(resolve => setTimeout(resolve, delay(500, 1000)));

    await page.waitForSelector('#id-Mail', { visible: true });
    await page.waitForSelector('#id-pwd', { visible: true });

    console.log('[OK] Login page loaded');
    await page.screenshot({ path: `${screenShotDirectory}/step1_view_login.png`, fullPage: true })

    const { IDF_MOBILITE_USERNAME, IDF_MOBILITE_PASSWORD } = process.env;

    // Simulate a human typing (between 100ms and 200ms between each typed car)
    await page.type('#id-Mail', IDF_MOBILITE_USERNAME, { delay: delay(100,200) });

    // wait before typing in the password field
    await new Promise(resolve => setTimeout(resolve, delay(800, 1600)));

    await page.type('#id-pwd', IDF_MOBILITE_PASSWORD, { delay: delay(100,200) });

    await page.waitForFunction(() => {
        const btn = document.querySelector('#login-bt');
        return btn && !btn.disabled;
    });

    await page.screenshot({ path: `${screenShotDirectory}/step2_view_filled_form.png`, fullPage: true })

    // Simulate a human and wait a little bit
    await new Promise(resolve => setTimeout(resolve, delay(800, 1600)));

    // Click on Login !
    await page.click('#login-bt');

    console.log('[OK] Login form submitted');

    // Wait navigation succes
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.screenshot({ path: `${screenShotDirectory}/step3_view_submitted_form.png`, fullPage: true });

    console.log('[INFO] Fetch IDF Mobilite authentication code in email...');

    // wait between 10 and 20sec that the email arrives...
    await new Promise(resolve => setTimeout(resolve, delay(10000, 20000)));

    const code = await getValidationCode();

    console.log('[OK] Code found ! : ' + code);

    // Wait for the input to appear
    await page.waitForSelector('#connectMailOtp');

    await page.type('#connectMailOtp', code, { delay: delay(100,200) });

    await page.screenshot({ path: `${screenShotDirectory}/step4_view_authentication_code_is_entered.png`, fullPage: true });

    await page.click('#bt-valider');

    // Wait navigation succes
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('[INFO] Authentication form submitted');

    // Simulate a human and wait a little bit
    await new Promise(resolve => setTimeout(resolve, delay(1500, 2000)));

    await page.screenshot({ path: `${screenShotDirectory}/step5_view_idf_mobilite_homepage.png`, fullPage: true });

    await page.waitForSelector('.content-bandeau', {
        visible: true,
        timeout: 6000,
    });

    // Wait navigation succes
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('[OK] IDF Mobilite Homepage reached');

    await page.goto('https://www.jegeremacartenavigo.iledefrance-mobilites.fr');

    // Simulate a human and wait a little bit
    await new Promise(resolve => setTimeout(resolve, delay(1500, 2000)));

    await page.waitForSelector('li.list-group-item.link-bloc');

    const listItems = await page.$$('li.list-group-item.link-bloc');

    console.log('[OK] Navigo management page reached');
    await page.screenshot({ path: `${screenShotDirectory}/step6_view_navigo_management_page.png`, fullPage: true });

    if (listItems.length >= 2) {
        await new Promise(resolve => setTimeout(resolve, delay(500, 1500)));
        await listItems[0].click(); // click first <li>
    } else {
        throw Error(`[ERROR] First matching <li> not found on Navigo management page`);
    }

    await page.waitForSelector('li.list-group-item.link-bloc');

    console.log('[OK] Navigo annual contract detail page reached');
    await page.screenshot({ path: `${screenShotDirectory}/step7_view_navigo_annual_contract_management_page.png`, fullPage: true });

    await new Promise(resolve => setTimeout(resolve, delay(1000, 1500)));

    const listItemsOnAnnualContract = await page.$$('li.list-group-item.link-bloc');

    if (listItemsOnAnnualContract.length >= 2) {
        await listItemsOnAnnualContract[0].click(); // click first <li>
    } else {
        throw Error(`[ERROR] Second matching <li> not found on Navigo annual contract`);
    }

    console.log('[OK] Navigo annual contract attestation detail page reached');
    await page.screenshot({ path: `${screenShotDirectory}/step8_view_navigo_annual_contract_attestation_detail_page.png`, fullPage: true });

    await page.waitForSelector('#div-mensual-attestation');

     await page.click('#attestation_type_0');
     await new Promise(resolve => setTimeout(resolve, delay(1000, 1500)));

    await page.screenshot({ path: `${screenShotDirectory}/step9_view_navigo_annual_contract_attestation_mensual_type.png`, fullPage: true });

    await page.click('img.picto[alt="Fichier PDF"]');

    const filePath = await waitForFile(downloadPath);
    console.log('[OK] Navigo attestation downloaded at: ', filePath);

    await browser.close();

    console.log(`All done, check the attestation file ✨`)
    process.exit(0);
})

async function simulateFrenchBrowser(page) {
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7'
    });
    await page.evaluateOnNewDocument(() => {
        Object.defineProperty(navigator, 'language', { get: () => 'fr-FR' });
        Object.defineProperty(navigator, 'languages', { get: () => ['fr-FR', 'fr'] });
    });

    await page.emulateTimezone('Europe/Paris');

    await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.1 Safari/537.36'
    );
}

function waitForFile(downloadPath, timeout = 15000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        const interval = setInterval(() => {
            const files = fs.readdirSync(downloadPath).filter(f => f.endsWith('.pdf'));
            if (files.length > 0) {
                clearInterval(interval);
                resolve(path.join(downloadPath, files[0]));
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                reject(new Error('Timeout waiting for download'));
            }
        }, 500);
    });
}

