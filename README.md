# RPG-Archivist

A lore management platform for TTRPG Game Masters, combining a wiki-style web interface with a connected Discord bot.

> **Status:** Active Development — Early Alpha.

## Overview

RPG-Archivist is a tool built for Tabletop RPG Game Masters to organize and reference campaign lore directly from Discord or a browser. Rather than juggling notes and spreadsheets, GMs can store and retrieve structured lore — traits, characters, items, and more — in one place.

## Features

### Web Application
- **Discord OAuth2 Authentication** — Secure login and logout via Discord, no separate account needed
- **Traits System** *(in progress)* — Store and manage traits granted through race, class, background, DM rewards, and more

### Discord Bot *(planned)*
- In-Discord lore lookups connected to the same backend as the web app

## Architecture

RPG-Archivist is structured as a monorepo using Turborepo and pnpm workspaces:

- `apps/web` — Wiki-style frontend
- `apps/api` — Backend API serving both the web app and Discord bot
- `apps/bot` — Discord bot 
- `packages/` — Shared configs and utilities

The bot and web application share a single backend, keeping lore data consistent across both interfaces.

## Tech Stack

- **Language:** TypeScript
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Auth:** Discord OAuth2
- **Monorepo:** Turborepo + pnpm

## Getting Started

> Setup instructions will be added as the project matures.

## Roadmap

- [x] Discord OAuth2 login/logout flow
- [ ] Traits CRUD routes (in progress)
- [ ] Frontend wiki interface
- [ ] Discord bot with lore query commands
- [ ] Public release
