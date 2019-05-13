# Instagram-File-Scraper
Instagram web scarper for post file downloads.
#Running/Development Requirements:
- Unix-style terminal/npm capable terminal
- Node.js
- Node Package Manager (NPM)
- TypeScript
# Using the program:
1. Run `$ npm start` in you command line.
2. Enter Instagram username in `? username: `.
3. Enter Instagram password in `? password: `.
4. Enter Instagram post ID from [https://www.instagram.com/p/id]() in `? id: `.
5. Wait until the program says:
>Download ended.
# How Does It Work?
1. The user puts his/her Instagram creditials and the desired post ID.
2. A bot Chromium browser is opened.
3. The credentials are are passed to a Puppeteer web scarper that logs in to Instagram as the user.
4. Puppeteer navigates to the post.
5. Puppeteer loads all available files and their URLs.
6. The program downloads the files to the current codebase directory.
7. The bot browser is closed.
# Please Make Sure That:
- The correct Instagram credentials are entered.
- The network is not too crowded.
- 2FA is turned off
 