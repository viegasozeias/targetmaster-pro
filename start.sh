#!/bin/sh

# Generate config.js from environment variables
echo "window.env = {" > /usr/share/nginx/html/config.js
echo "  VITE_SUPABASE_URL: \"$VITE_SUPABASE_URL\"," >> /usr/share/nginx/html/config.js
echo "  VITE_SUPABASE_ANON_KEY: \"$VITE_SUPABASE_ANON_KEY\"," >> /usr/share/nginx/html/config.js
echo "  VITE_STRIPE_PUBLISHABLE_KEY: \"$VITE_STRIPE_PUBLISHABLE_KEY\"" >> /usr/share/nginx/html/config.js
echo "};" >> /usr/share/nginx/html/config.js

# Start Nginx
nginx -g "daemon off;"
