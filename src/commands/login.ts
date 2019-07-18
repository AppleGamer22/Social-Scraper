import {launch, Browser} from "puppeteer-core";
import { Command, flags } from "@oclif/command";
import {config} from "dotenv";
import cli from "cli-ux";
import {chromeExecutable, writeEnviornmentVariables, chromeUserDataDirectory, environmentVariablesFile, userAgent} from "../shared";

export default class LogIn extends Command {
	static description = "Command for supported social network log-in.";
	static flags = {
		vsco: flags.boolean({char: "v", description: "Toggle for providing VSCO credentials."}),
		instagram: flags.boolean({char: "i", description: "Toggle for providing Instagram credentials."})
	};

	async run() {
		config({path: environmentVariablesFile});
		try {
			const username = await cli.prompt("Username");
			const password = await cli.prompt("password", {type: "hide"});
			cli.action.start("Opening Puppeteer...");
			const browser = await launch({
				headless: true,
				executablePath: chromeExecutable(),
				userDataDir: chromeUserDataDirectory,
				defaultViewport: null
			});
			cli.action.stop();
			const {flags} = this.parse(LogIn);
			if (flags.instagram) return await this.instagramSignIn(browser, username, password);
			if (flags.vsco) return await this.vscoSignIn(browser, username, password);
		} catch (error) { console.error(error.message); }
	}

	async instagramSignIn(browser: Browser, username: string, password: string) {
		try {
			if (process.env.INSTAGRAM! === "true") {
				await browser.close();
				return console.log("You are already logged-in.");
			}
			const page = (await browser.pages())[0];
			page.on("framenavigated", async frame => {
				if (frame.url() === "https://www.instagram.com/") {
					var environmentFileData: string;
					const {VSCO} = process.env;
					if (VSCO !== undefined) {
						environmentFileData = `INSTAGRAM=${true}
VSCO=${VSCO}`;
						writeEnviornmentVariables(environmentFileData);
						console.log("Log-in sucessful.");
						await browser.close();
					} else if (VSCO === undefined) {
						environmentFileData = `INSTAGRAM=${true}`;
						writeEnviornmentVariables(environmentFileData);
						console.log("Log-in sucessful.");
						await browser.close();
					}
				}
			});
			await page.setUserAgent(userAgent);
			await page.goto("https://www.instagram.com/accounts/login/");
			await page.waitForSelector(`input[name="username"]`);
			await page.type(`input[name="username"]`, username);
			await page.type(`input[name="password"]`, password);
			await page.click(`button[type="submit"]`);
		} catch (error) { console.error(error.message); }
	}
	async vscoSignIn(browser: Browser, username: string, password: string) {
		if (process.env.VSCO! === "true") return console.log("You are already loged-in.");
		console.log("Sign-in to you VSCO account.");
		try {
			const page = (await browser.pages())[0];
			page.on("framenavigated", async frame => {
				if (frame.url() === "https://vsco.co/") {
					var environmentFileData: string;
					const {INSTAGRAM} = process.env;
					if (INSTAGRAM !== undefined) {
						environmentFileData = `VSCO=${true}
INSTAGRAM=${INSTAGRAM}`;
						writeEnviornmentVariables(environmentFileData);
						console.log("Log-in sucessful.");
						await browser.close();
					} else if (INSTAGRAM === undefined) {
						environmentFileData = `VSCO=${true}
INSTAGRAM=${false}`;
						writeEnviornmentVariables(environmentFileData);
						console.log("Log-in sucessful.");
						await browser.close();
					}
				}
			});
			await page.setUserAgent(userAgent);
			await page.goto("https://vsco.co/user/login");
			await page.waitForSelector("input#login");
			await page.type("input#login", username);
			await page.type("input#password", password);
			await page.click("button#loginButton");
		} catch (error) { console.error(error.message); }
	}
}