import {Command, flags} from "@oclif/command";
import {launch, Browser} from "puppeteer-core";
import {config} from "dotenv";
import cli from "cli-ux";
import {randomBytes} from "crypto";
import {chromeExecutable, writeEnviornmentVariables, chromeUserDataDirectory, environmentVariablesFile, userAgent} from "../shared";

export default class LogOut extends Command {
	static description = "Command for supported social network log-out.";
	static flags = {
		vsco: flags.boolean({char: "v", description: "Toggle for VSCO log-out"}),
		instagram: flags.boolean({char: "i", description: "Toggle for Instagram logout."})
	};

	async run() {
		config({path: environmentVariablesFile});
		try {
			cli.action.start("Opening Puppeteer...");
			const browser = await launch({
				headless: true,
				executablePath: chromeExecutable(),
				userDataDir: chromeUserDataDirectory,
				defaultViewport: null
			});
			cli.action.stop();
			const {flags} = this.parse(LogOut);
			if (flags.instagram) return await this.instagramSignOut(browser);
			if (flags.vsco) return await this.vscoSignOut(browser);
		} catch (error) { console.error(error.message); }
	}

	async instagramSignOut(browser: Browser) {
		try {
			if (!JSON.parse(process.env.INSTAGRAM!)) {
				await browser.close();
				return console.log("You are already signed-out.");
			}
			const page = (await browser.pages())[0];
			await page.setUserAgent(userAgent);
			page.on("framenavigated", async frame => {
				if (frame.url() === "https://www.instagram.com/") {
					var environmentFileData: string;
					const {VSCO} = process.env;
					if (VSCO !== undefined) {
						environmentFileData = `VSCO=${VSCO}
INSTAGRAM=${false}`;
						writeEnviornmentVariables(environmentFileData);
						console.log("Log-out sucessful.");
						await browser.close();
					} else if (VSCO === undefined) {
						environmentFileData = `VSCO=${false}
INSTAGRAM=${false}`;
						writeEnviornmentVariables(environmentFileData);
						console.log("Log-out sucessful.");
						await browser.close();
					}
				}
			});
			await page.goto(`https://www.instagram.com/${randomBytes(5).toString("hex")}/`);
			const profileButton = "#link_profile > a";
			await page.waitForSelector(profileButton);
			await page.click(profileButton);
			const settingsButton = "#react-root > section > main > div > header > section > div.nZSzR > div > button";
			await page.waitForSelector(settingsButton);
			await page.click(settingsButton);
			const logOutButton = "body > div.RnEpo.Yx5HN > div > div > div > button:nth-child(6)";
			await page.waitForSelector(logOutButton);
			await page.click(logOutButton);
		} catch (error) { console.error(error.message); }
	}
	async vscoSignOut(browser: Browser) {
		try {
			const page = (await browser.pages())[0];
			await page.setUserAgent(userAgent);
			await page.goto("https://vsco.co/user/login");
		} catch (error) { console.error(error.message); }
	}
}