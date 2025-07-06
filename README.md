# Unboxable Learning Portal

A learning management system integrated with unboxable.co.nz, featuring course management, learner dashboards, and survey functionality.

## Integration Configuration

This application is configured to be deployed at `unboxable.co.nz/learning` as a subdirectory of the main Unboxable website.

### Development vs Production

- **Development**: Runs on `localhost:8080` with standard routing
- **Production**: Configured for `/learning` subdirectory with appropriate base paths

### Key Configuration Files

- `vite.config.ts`: Configured with base path for production deployment
- `src/App.tsx`: Router basename configuration for subdirectory routing
- Components include "Back to Unboxable" navigation for seamless integration

### Deployment Steps

1. Build the application: `npm run build`
2. Deploy the `dist` folder contents to your web server under `/learning` directory
3. Configure web server (Apache/Nginx) to handle React Router for SPA routing
4. Update Supabase authentication redirect URLs to match your domain structure

### Features

- **Learner Dashboard**: Course progress tracking and module access
- **Admin Dashboard**: User management, course creation, survey approval
- **Course Management**: Create and manage learning modules
- **Survey System**: Pre/post course assessments
- **Analytics**: Learning progress and engagement tracking
- **Calendar**: Course scheduling and email automation

### Brand Integration

The learning portal maintains consistent branding with the main Unboxable website:
- Montserrat font family
- Unboxable color scheme (navy blue #2B4C7E, orange #FF6500)
- Consistent navigation and user experience
- Seamless transitions between main site and learning portal

### Authentication

Uses Supabase for authentication and data management. Configure your Supabase project settings to match your deployment domain for proper authentication flow.

---

# Original Lovable Project Info

## Project info

**URL**: https://lovable.dev/projects/48c14c99-8023-4c6d-af1c-7d89636d5488

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/48c14c99-8023-4c6d-af1c-7d89636d5488) and start prompting.

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

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/48c14c99-8023-4c6d-af1c-7d89636d5488) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
