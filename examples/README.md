# How To Use

1. Get the `docker-compose.yml` file by running

```sh
wget https://raw.githubusercontent.com/SuspiciousLookingOwl/degabut.js/development/examples/docker-compose.yml
```

or

```sh
curl https://raw.githubusercontent.com/SuspiciousLookingOwl/degabut.js/development/examples/docker-compose.yml -o docker-compose.yml
```

2. Create an `.env` file (`nano .env`), paste the [`.env` values](./.env.example) and modify the values as needed

```sh
PREFIX=!
TOKEN=your-token-here

POSTGRES_DB=degabut
POSTGRES_USER=user
POSTGRES_PASSWORD=long-randomly-generated-password

API_SERVER=false

# only needed if API_SERVER is true for authentication
# DISCORD_OAUTH_CLIENT_ID=
# DISCORD_OAUTH_CLIENT_SECRET=
# DISCORD_OAUTH_REDIRECT_URI=
```

3. Run it with

```sh
docker-compose up -d
```
