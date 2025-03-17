# Notion Image Carousel Widget

A simple, elegant image carousel widget designed specifically for Notion embeds. Display your Google Drive images in a beautiful, automatically scrolling carousel directly in your Notion pages.

## Features

- **Google Drive Integration**: Display images stored in Google Drive
- **Infinite Scrolling**: Smooth, continuous image transitions
- **Customizable**: Configure image selection and carousel height
- **Configuration UI**: Add/remove images directly in the interface
- **Responsive Design**: Works well in Notion embeds

## Usage Instructions

1. **Setup Google Drive Images**:
   - Upload images and ensure they're shared with "Anyone with the link can view"
   - Copy either the image ID or sharing URL

2. **Configure the Carousel**:
   - Click the "Configure" button in the carousel
   - Paste Google Drive image IDs or URLs and save

3. **Embed in Notion**:
   - Paste the deployed URL into a Notion embed block
   - Adjust the embed dimensions as needed

## Development

This project is built with:
- Vite + React + TypeScript
- shadcn-ui components
- Tailwind CSS

### Running Locally

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Deployment

Deploy using the [Lovable](https://lovable.dev/projects/09040ec7-3a91-42d5-b673-192ba10f4c2a) platform or export to your preferred hosting service.

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
