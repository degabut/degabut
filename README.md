# Degabut

`Degabut` is a Discord bot with music functionalities.

## Environment Variables

- `TOKEN`: your Discord bot token
- `PREFIX`: command prefix detected by the bot

## Run

Docker Image: [suspiciouslookingowl/degabut](https://hub.docker.com/r/suspiciouslookingowl/degabut)

```
docker run --env TOKEN=xyz --env PREFIX=! -d suspiciouslookingowl/degabut
```

Alternatively, create a `.env` file containing:

```env
PREFIX=!
TOKEN=xyz
```

and run

```
docker run --env-file ./.env -d suspiciouslookingowl/degabut
```

Or using Docker Compose:

```yaml
version: "3.9"
services:
  degabut:
    container_name: degabut
    image: suspiciouslookingowl/degabut:latest
    restart: always
    env_file:
      - .env
```
