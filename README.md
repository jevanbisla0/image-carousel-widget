# Google Drive Image Carousel

A lightweight, clean React carousel widget for displaying Google Drive images in Notion pages.

## Features

- Simple, responsive design with infinite scrolling effect
- Display images stored in Google Drive 
- User-friendly configuration interface
- Effortless integration with Notion embeds

## Usage

1. **Prepare your Google Drive images**:
   - Upload images to Google Drive
   - Set sharing to "Anyone with the link can view"

2. **Configure the carousel**:
   - Click the button at the bottom of the carousel
   - Paste Google Drive image IDs or sharing URLs
   - Click "Save Configuration"

3. **Embed in Notion**:
   - Add the app URL to a Notion embed block
   - Adjust the embed height as needed

## Development

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Architecture

This app is built with a clean, minimal architecture:

- **React + TypeScript**: Type-safe and maintainable code
- **TailwindCSS**: Utility-first styling 
- **Local Storage**: Simple persistence without backend requirements
- **Module Structure**:
  - `lib/`: Utilities, types, and shared functions
  - `components/`: Reusable UI components
  - `pages/`: Main application views

The code is intentionally kept simple, avoiding unnecessary abstractions and dependencies.

## Technologies

- React + TypeScript
- Tailwind CSS
- Vite

## Project info

**URL**: https://lovable.dev/projects/09040ec7-3a91-42d5-b673-192ba10f4c2a

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/09040ec7-3a91-42d5-b673-192ba10f4c2a) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
