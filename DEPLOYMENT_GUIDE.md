# Deployment Guide

This guide covers deploying the Maya-29 AI Image Generator to various platforms.

## Replit Deployment (Recommended)

### Prerequisites
1. Replit account
2. Replicate API token
3. Database URL (Neon Database recommended)

### Steps
1. **Import Repository**
   - Go to Replit.com
   - Click "Create Repl"
   - Select "Import from GitHub"
   - Enter your repository URL

2. **Configure Environment**
   - Go to "Secrets" tab in Replit
   - Add the following secrets:
     ```
     REPLICATE_API_TOKEN=your_token_here
     DATABASE_URL=your_database_url_here
     BASE_PATH=/mayamann
     ```

3. **Install Dependencies**
   - Replit should automatically detect and install dependencies
   - If not, run: `npm install`

4. **Run the Application**
   - Click the "Run" button
   - The application will start on port 5000

5. **Deploy to Custom Domain**
   - Configure BASE_PATH for your deployment path
   - Deploy to `twentynine.technology/mayamann`

## Manual Server Deployment

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Process manager (PM2 recommended)

### Steps
1. **Server Setup**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/maya-29-generator.git
   cd maya-29-generator
   
   # Install dependencies
   npm install
   
   # Build the application
   npm run build
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your values
   nano .env
   ```

3. **Database Setup**
   ```bash
   # Push database schema
   npm run db:push
   ```

4. **Process Manager Setup**
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Start application with PM2
   pm2 start npm --name "maya-29" -- start
   
   # Save PM2 configuration
   pm2 save
   pm2 startup
   ```

5. **Nginx Configuration** (optional)
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location /mayamann {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Start application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  maya-29:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN}
      - BASE_PATH=/mayamann
    volumes:
      - ./generated_images:/app/generated_images
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: maya29_generator
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | development | No |
| `PORT` | Server port | 5000 | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `REPLICATE_API_TOKEN` | Replicate API token | - | Yes |
| `BASE_PATH` | Base deployment path | '' | No |

## Health Checks

The application provides several endpoints for monitoring:

- `GET /health` - Basic health check
- `GET /api/images/count` - Image count (also serves as API health check)

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correct
   - Ensure database is accessible from deployment environment
   - Check firewall settings

2. **Replicate API Errors**
   - Verify REPLICATE_API_TOKEN is valid
   - Check Replicate account credits/limits
   - Ensure network can reach replicate.com

3. **File Storage Issues**
   - Verify generated_images directory exists
   - Check write permissions
   - Ensure sufficient disk space

4. **Port Binding Issues**
   - Check if port 5000 is available
   - Verify no other applications are using the port
   - Consider changing PORT environment variable

### Logs

```bash
# View application logs (PM2)
pm2 logs maya-29

# View application logs (Docker)
docker logs maya-29-container

# View database logs
tail -f /var/log/postgresql/postgresql.log
```

## Performance Optimization

### Production Settings
- Set `NODE_ENV=production`
- Enable gzip compression
- Configure proper caching headers
- Use a CDN for static assets

### Database Optimization
- Enable connection pooling
- Configure appropriate connection limits
- Set up database monitoring

### Image Storage
- Consider using cloud storage (S3, Google Cloud Storage)
- Implement image cleanup policies
- Monitor disk usage

## Security Considerations

1. **Environment Variables**
   - Never commit .env files
   - Use secure secret management
   - Rotate API tokens regularly

2. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Limit database access

3. **Network Security**
   - Use HTTPS in production
   - Configure proper CORS settings
   - Implement rate limiting

4. **File Upload Security**
   - Validate file types
   - Limit file sizes
   - Scan for malware

## Monitoring

### Application Metrics
- Response times
- Error rates
- Memory usage
- CPU utilization

### Business Metrics
- Images generated per hour
- API usage patterns
- User engagement

### Alerting
Set up alerts for:
- Application downtime
- High error rates
- Database connectivity issues
- Disk space warnings