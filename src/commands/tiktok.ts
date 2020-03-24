import { Command, flags } from "@oclif/command";
import { cli } from "cli-ux";
import { Browser, Page } from "puppeteer-core";
import { get } from "superagent";
import { underline } from "chalk";
import { writeFileSync } from "fs";
import { alert, beginScrape, ScrapePayload, userAgent } from "../shared";

export default class TikTok extends Command {
	static description = "Command for scraping TikTok post file.";
	static args = [
		{
			name: "user",
			required: true
		},{
			name: "post",
			required: true
		}
	];
	static flags = {headless: flags.boolean({char: "h", description: "Toggle for background scraping."})};

	async run() {
		try {
			const { args, flags } = this.parse(TikTok);
			if (args.user && args.post) {
				const now = Date.now();
				cli.action.start("Opening browser");
				const { browser, page } = (await beginScrape(flags.headless))!;
				cli.action.stop();
				cli.action.start("Searching for files");
				const payload = await detectFile(browser, page, args.user, args.post);
				cli.action.stop();
				if (payload) {
					const { username, urls } = payload;
					alert(`Scrape time: ${(Date.now() - now)/1000}s`, "info");
					cli.action.start("Downloading");
					await this.downloadFile(urls[0], username, args.post);
					cli.action.stop();
				}
				await browser.close();
			} else return alert("Please provide a POST argument!", "danger");
		} catch (error) { alert(error.message, "danger"); }
	}

	async downloadFile(url: string, username: string, id: string) {
		try {
			const path = `${process.cwd()}/${username}_${id}.mp4`;
			const { body, status } = await get(url).responseType("blob");
			if (status	 === 200) {
				alert(underline(".mp4"), "log");
				cli.url(underline(url), url);
				writeFileSync(path, body, {encoding: "binary"});
				alert(`File saved at ${path}`, "success");
			}
		} catch (error) {
			alert(error.message, "danger");
		}
	}
}

export async function detectFile(browser: Browser, page: Page, user: string, post: string): Promise<ScrapePayload | undefined> {
	try {
		await page.goto(`https://tiktok.com/@${user}/video/${post}`, {waitUntil: "domcontentloaded"});
		if ((await page.$("div.error-page")) !== null) {
			alert(`Failed to find ${user}'s post ${post}`, "danger");
			await browser.close();
		}
		await page.waitForSelector("h2.user-username", {visible: true});
		const username = await page.evaluate(() => {
			const a = document.querySelector("h2.user-username") as HTMLHeadingElement;
			return a.innerText.replace("@", "");
		});
		await page.waitForSelector("video", {visible: true});
		const videoURL = await page.$eval("video", video => video.getAttribute("src"));
		if (videoURL) return {urls: [videoURL], username};
	} catch (error) { alert(error.message, "danger"); }
}