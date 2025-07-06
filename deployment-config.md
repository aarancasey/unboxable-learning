# Deployment Configuration for unboxable.co.nz/learning

## Web Server Configuration

### Apache (.htaccess in /learning directory)
```apache
RewriteEngine On
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /learning/index.html [L]
```

### Nginx Configuration
```nginx
location /learning {
    alias /path/to/your/learning-portal/dist;
    try_files $uri $uri/ /learning/index.html;
    
    # Handle static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Supabase Configuration Updates

After deployment, update these URLs in your Supabase dashboard:

1. **Authentication > URL Configuration**
   - Site URL: `https://unboxable.co.nz`
   - Redirect URLs: 
     - `https://unboxable.co.nz/learning`
     - `https://unboxable.co.nz/learning/`

2. **Edge Functions**
   - Update any edge functions that reference the domain
   - Update CORS settings if needed

## Build Process

```bash
# Install dependencies
npm install

# Build for production
npm run build

# The dist folder contents should be deployed to your web server's /learning directory
```

## Testing Checklist

- [ ] App loads correctly at `unboxable.co.nz/learning`
- [ ] All internal navigation works (stays within learning portal)
- [ ] "Back to Unboxable" button works in both learner and admin views
- [ ] Authentication flow works correctly
- [ ] Static assets (images, CSS, JS) load properly
- [ ] Responsive design works on mobile devices
- [ ] All features function as expected in the subdirectory context

## Important Notes

- The app is configured to automatically detect production vs development environment
- In development, it runs normally on localhost:8080
- In production, it automatically configures for the `/learning` subdirectory
- All changes made through Lovable will maintain this configuration