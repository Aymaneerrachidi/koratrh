# $KORAT

A launch-ready memecoin website and Telegram lore bot for an independent Korat project on Robinhood Chain. Both chat surfaces use the same guarded knowledge source and automatic LLM fallback chain.

## Included

- Responsive Next.js landing page with generated Korat artwork
- Website LLM chat with loading, error, and suggested-question states
- Telegram bot with `/start`, `/lore`, `/chain`, `/contract`, and `/reset`
- Shared factual Korat breed lore and confirmed Robinhood Chain basics
- Cohere-first LLM routing with automatic Groq fallback
- Multilingual LLM topic enforcement for cats, $KORAT, and relevant Robinhood Chain questions
- Wallet helper for Robinhood Chain mainnet, chain ID `4663`
- Contract and community links controlled through environment variables
- Light and dark themes, reduced-motion support, and mobile layouts

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and add at least one LLM key:

   ```bash
   Copy-Item .env.example .env.local
   ```

3. Start the website:

   ```bash
   npm run dev
   ```

4. In a second terminal, start the Telegram bot:

   ```bash
   npm run bot
   ```

Create the Telegram token with [BotFather](https://t.me/BotFather). Set the generated avatar at `public/images/korat-avatar.png` as the bot profile photo.

## Keeping the Telegram bot online

The bot runs two ways from one shared definition in `lib/korat-bot.ts`:

- **Local development**: `npm run bot` uses long polling. It only runs while your
  machine is awake and the terminal is open.
- **Production**: Telegram pushes updates to `/api/telegram`, which is deployed
  with the website. Nothing has to stay awake.

Never run both against the same token at once. Telegram allows only one.

### One-time webhook setup

1. Deploy the site, then set these in the Vercel project settings:

   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_WEBHOOK_SECRET` (any random string you invent)
   - the LLM keys, and the `NEXT_PUBLIC_*` launch values

2. Point Telegram at the deployment:

   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<your-domain>/api/telegram&secret_token=<YOUR_SECRET>"
   ```

3. Register the command menu once:

   ```bash
   curl -X POST "https://api.telegram.org/bot<TOKEN>/setMyCommands"      -H "content-type: application/json"      -d '{"commands":[{"command":"start","description":"Meet the good luck cat"},{"command":"lore","description":"The origin story, short version"},{"command":"chain","description":"Robinhood Chain basics"},{"command":"ca","description":"Show the confirmed contract address"},{"command":"reset","description":"Wipe my memory"}]}'
   ```

4. Check it: `GET /api/telegram` returns `{"ok":true,"configured":true,"secured":true}`,
   and `getWebhookInfo` should show your URL with no `last_error_message`.

To go back to local polling, run `npm run bot`. It deletes the webhook on start.

### Notes

- The secret header is verified on every request, so nobody else can post updates.
- Conversation memory is in-process. On serverless it survives only while an
  instance stays warm, so treat multi-turn memory as best effort. `/reset` always works.
- `.env.local` overrides `.env` in Next.js. An empty value there wins over a real
  one in `.env`, which silently disables the bot.

## LLM fallback order

The shared router at `lib/llm.ts` tries each configured provider in this order:

1. Cohere, `command-a-plus-05-2026`
2. Groq, `llama-3.1-8b-instant`

If a provider times out, returns an error, reaches a rate limit, or sends an empty answer, the next configured provider is tried automatically. Each provider has a 15-second timeout. Keys stay on the server and are never sent to the browser.

Free access is best suited to development and low-volume community use:

- Cohere creates a free rate-limited trial key, but trial keys are not permitted for production or commercial use.
- Groq offers a rate-limited Free Plan with model-specific request and token caps.

For a public launch, keep at least two providers configured and move the primary provider to a production-eligible key.

## Launch configuration

These values can stay blank during development:

- `NEXT_PUBLIC_CONTRACT_ADDRESS`: the verified $KORAT token address
- `NEXT_PUBLIC_SWAP_URL`: the direct verified trading route
- `NEXT_PUBLIC_TELEGRAM_URL`: community or bot URL
- `NEXT_PUBLIC_X_URL`: official X profile

Never publish the contract UI until the deployed address has been verified on the Robinhood Chain explorer.

## Sources used for the knowledge layer

- [Cat Fanciers' Association Korat profile](https://cfa.org/breed/korat/) (primary source, credited in the site footer)
- [The International Cat Association Korat profile](https://tica.org/breed/korat/)
- [Korat and Thai Cat Association breed profile](https://www.korats.org.uk/breed-profile/)
- [Robinhood Chain documentation](https://docs.robinhood.com/chain/)
- [Robinhood Chain network configuration](https://docs.robinhood.com/chain/connecting/)
- [Cohere Chat API](https://docs.cohere.com/reference/chat)
- [Groq rate limits](https://console.groq.com/docs/rate-limits)

The cat health content is educational only. The project is not affiliated with Robinhood, and the assistant is explicitly instructed not to provide price predictions or financial advice.

## Generated image prompts

Built-in image generation was used with the two files in `pics/` as style and subject references.

- `public/images/korat-hero.png`: wide editorial studio photo of a silver-blue Korat on a flat pistachio-chartreuse field, cat positioned right with clean headline space on the left.
- `public/images/korat-avatar.png`: centered close-up Korat portrait on the same pistachio-chartreuse field, optimized for social and Telegram avatar use.
