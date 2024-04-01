<p align="center">
    <img src="site/public/cyno.png" alt="Cyno Logo" height="100px" />
</p>
<p align="center">
    <b>Cyno:</b> The bot that makes your Discord server more fun!
</p>

---

This repository contains the source tree for Cyno. There are 3 main parts to the Cyno source tree:

-   `bot`: The source code for the bot. The bot uses [react-djs](https://github.com/iamjsd/react-djs) to manage interactions.
-   `site`: This contains the Next app router based site that powers the dashboard at [cyno.lol](https://cyno.lol). This is designed to both be deployable on the edge at Vercel (for our managed instance) and to be able to be self-hosted for custom instances of the bot.
-   `database`: This package contains the database logic that is shared between both of these.

Husky is used to ensure code consistency on commit and run the lints within the web application. The bot is built using some custom logic built on top of ESBuild. In some situations, when you add dependencies, you may need to update `bot/build.cjs` to stop it being bundled. The bot will hot reload in development mode.

## Developing Cyno

To develop Cyno, you will need the following:

-   A Discord bot user.
-   A uploadthing project.
-   node,js 20 or higher (lower Node versions might work, but are untested).

Once you have these, you can run `npm ci` to go ahead and install all the dependencies for all of your packages and then run `npm run dev`. The first time you run this, you will get a CLI setup wizard to walk you through setting up your devlopment environment. After that (or instantly if you have walked through the setup before), foreman will then start all the required processes. You can then go to `localhost:5100` to see the dashboard or interact with the bot in Discord.
