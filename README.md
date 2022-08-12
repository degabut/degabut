# Degabut

`Degabut` is a Discord bot with music functionalities.

[Examples](https://github.com/degabut/examples)

## Environment Variables

- `TOKEN`: your Discord bot token
- `PREFIX`: command prefix detected by the bot
- `POSTGRES_DB`: postgres database name
- `POSTGRES_USER`: postgres user name
- `POSTGRES_PASSWORD`: postgres password
- `JWT_PRIVATE_KEY`: long random string for JWT signing
- `DISCORD_OAUTH_CLIENT_ID`: Discord OAuth Client ID
- `DISCORD_OAUTH_CLIENT_SECRET`: Discord OAuth Client Secret
- `DISCORD_OAUTH_REDIRECT_URI`: DIscord OAuth Redirect URI

## Run

Check the examples [here](https://github.com/degabut/examples)

## Development

1. [Install `pnpm`](https://pnpm.io/installation):
```
npm i -g pnpm
```
2. Install dependencies:
```
pnpm i
```
3. Copy `.env.example` to `.env` and change the values
4. Start a Postgres server
5. Start the dev server
```
pnpm start:dev
```
