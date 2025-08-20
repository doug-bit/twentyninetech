# Deployment Guide: twentynine.technology/mayamann

This guide explains how to deploy your Maya AI image generation app to `twentynine.technology/mayamann`.

## Overview
The app has been configured to support deployment with a base path using environment variables. The key changes made:

- ✅ Server routes now use `BASE_PATH` environment variable
- ✅ Client API calls use configurable base path
- ✅ Image serving works with subpath routing

## Deployment Steps

### 1. Environment Variables
When deploying, set these environment variables in Replit:

```
BASE_PATH=/mayamann
VITE_BASE_PATH=/mayamann
REPLICATE_API_TOKEN=r8_BKXQ02U8rPpMUDMSC1iScTwqRI3Nrac4SMJbw
```

### 2. Build Commands
For production deployment, use these commands:

```bash
# Build with base path
VITE_BASE_PATH=/mayamann npm run build

# Start with base path
BASE_PATH=/mayamann npm start
```

### 3. Replit Deployment Configuration

In Replit Deployments:
1. Go to your Repl settings
2. Navigate to Deployments
3. Set up a new deployment
4. Configure environment variables:
   - `BASE_PATH=/mayamann`
   - `VITE_BASE_PATH=/mayamann`
   - `REPLICATE_API_TOKEN=r8_BKXQ02U8rPpMUDMSC1iScTwqRI3Nrac4SMJbw`

### 4. Custom Domain Setup

To use your custom domain `twentynine.technology`:

1. In Replit Deployments, go to "Custom Domains"
2. Add `twentynine.technology` as your custom domain
3. Configure your domain's DNS to point to Replit's servers
4. The app will be accessible at `twentynine.technology/mayamann`

### 5. URL Routing Configuration

Since Replit doesn't support subpath routing directly, you may need to:

1. Deploy the app to a subdomain like `mayamann.twentynine.technology`
2. OR use a reverse proxy/CDN like Cloudflare to route `/mayamann` to your Replit deployment

### 6. Testing

Once deployed, verify these endpoints work:
- `twentynine.technology/mayamann` - Main interface  
- `twentynine.technology/mayamann/api/generate` - Image generation
- `twentynine.technology/mayamann/api/images/count` - Image count
- `twentynine.technology/mayamann/api/images/[filename]` - Image serving

## Current Status

✅ **App is ready for deployment** with the following features:
- Flux Schnell AI model integration
- 3:4 aspect ratio images perfect for LED wall
- Auto-reset timer for kiosk operation
- Local image storage and serving
- Professional Lenovo-branded interface
- Futuristic streetwear styling prompts

## Next Steps

1. Set the environment variables in Replit
2. Deploy using Replit Deployments
3. Configure your custom domain
4. Test the deployment at your domain

The app is fully functional and ready for your LED wall display at twentynine.technology/mayamann!