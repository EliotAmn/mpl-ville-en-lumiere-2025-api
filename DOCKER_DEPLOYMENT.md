# Docker Deployment Guide

This guide explains how to deploy the Ville en Lumière voting system using Docker Compose for production.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)

## Quick Start

1. **Clone the repository** and navigate to the project root:
```bash
cd /path/to/mpl-ville-en-lumiere-2025-api
```

2. **Build and start all services**:
```bash
docker-compose up -d --build
```

3. **Access the application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:4000
   - WebSocket: ws://localhost:4000

## Architecture

The Docker Compose setup includes two services:

### Server (Backend)
- **Technology**: Node.js 20 Alpine
- **Port**: 4000
- **Features**:
  - Multi-stage build for optimized image size
  - Production-only dependencies
  - Health checks for reliability
  - Automatic restart on failure

### Frontend
- **Technology**: Nginx Alpine
- **Port**: 80
- **Features**:
  - Built with Vite for optimal performance
  - Served via Nginx for fast delivery
  - Gzip compression enabled
  - Static asset caching (1 year)
  - Security headers configured

## Environment Variables

### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```bash
VITE_WS_HOST=localhost
VITE_WS_PORT=4000
```

For production deployment, update these values to match your domain:

```bash
VITE_WS_HOST=your-domain.com
VITE_WS_PORT=4000
```

### Server Configuration

The server uses port 4000 by default. To change it, modify the `docker-compose.yml`:

```yaml
services:
  server:
    environment:
      - PORT=4000  # Change this value
    ports:
      - "4000:4000"  # Update both values
```

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f frontend
```

### Rebuild and restart
```bash
docker-compose up -d --build
```

### Check service status
```bash
docker-compose ps
```

### Check health status
```bash
docker inspect --format='{{json .State.Health}}' mpl-ville-server
docker inspect --format='{{json .State.Health}}' mpl-ville-frontend
```

## Production Deployment

### 1. Prepare Environment Variables

Create `.env` files for both frontend and server with production values.

**Frontend** (`.env`):
```bash
VITE_WS_HOST=your-production-domain.com
VITE_WS_PORT=4000
```

### 2. Update Docker Compose for Production

For production with a reverse proxy (recommended), update `docker-compose.yml`:

```yaml
version: '3.8'

services:
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: mpl-ville-server
    restart: unless-stopped
    expose:
      - "4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
    networks:
      - mpl-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: mpl-ville-frontend
    restart: unless-stopped
    expose:
      - "80"
    depends_on:
      - server
    networks:
      - mpl-network

  nginx:
    image: nginx:alpine
    container_name: mpl-ville-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - server
    networks:
      - mpl-network

networks:
  mpl-network:
    driver: bridge
```

### 3. SSL/HTTPS Configuration

For HTTPS support, place your SSL certificates in an `ssl/` directory and configure nginx accordingly.

### 4. Build and Deploy

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Verify all services are running
docker-compose ps
```

## Monitoring

### View Resource Usage
```bash
docker stats mpl-ville-server mpl-ville-frontend
```

### Health Checks

Both services include health checks that run every 30 seconds:
- Server: Checks `/api/results` endpoint
- Frontend: Checks nginx is serving content

If a service fails 3 consecutive health checks, Docker will mark it as unhealthy.

## Troubleshooting

### Services won't start
```bash
# Check logs for errors
docker-compose logs

# Check if ports are already in use
lsof -i :80
lsof -i :4000
```

### WebSocket connection fails
- Verify the server is running: `docker-compose ps`
- Check server logs: `docker-compose logs server`
- Ensure frontend `.env` has correct WS_HOST and WS_PORT
- Verify firewall allows connections to port 4000

### Frontend shows connection error
- Check if backend is accessible: `curl http://localhost:4000/api/results`
- Verify WebSocket environment variables
- Check browser console for detailed error messages

### Rebuild after code changes
```bash
# Stop services
docker-compose down

# Rebuild with no cache
docker-compose build --no-cache

# Start services
docker-compose up -d
```

## Updating the Application

1. **Pull latest code**:
```bash
git pull origin main
```

2. **Rebuild containers**:
```bash
docker-compose down
docker-compose up -d --build
```

3. **Zero-downtime deployment** (advanced):
```bash
# Build new images
docker-compose build

# Start new containers alongside old ones
docker-compose up -d --no-deps --scale server=2 --no-recreate server

# Stop old containers
docker-compose up -d --no-deps --scale server=1 server
```

## Backup

### Backup Container Logs
```bash
docker-compose logs > backup-logs-$(date +%Y%m%d).txt
```

### Export Images
```bash
docker save mpl-ville-en-lumiere-2025-api-server:latest | gzip > server-image.tar.gz
docker save mpl-ville-en-lumiere-2025-api-frontend:latest | gzip > frontend-image.tar.gz
```

## Security Best Practices

1. **Use environment variables** for sensitive configuration
2. **Enable HTTPS** in production
3. **Run containers as non-root user** (add to Dockerfiles)
4. **Regularly update base images**:
   ```bash
   docker-compose pull
   docker-compose up -d --build
   ```
5. **Scan images for vulnerabilities**:
   ```bash
   docker scan mpl-ville-en-lumiere-2025-api-server
   ```

## Performance Optimization

### Adjust Nginx worker processes

Edit `frontend/nginx.conf` and add at the top:
```nginx
worker_processes auto;
worker_rlimit_nofile 65535;
```

### Enable HTTP/2

In your reverse proxy configuration, enable HTTP/2 for better performance.

## Scaling

To run multiple backend instances:

```bash
docker-compose up -d --scale server=3
```

Note: You'll need a load balancer (like nginx) to distribute traffic.

## Support

For issues or questions, check:
- Application logs: `docker-compose logs`
- Docker documentation: https://docs.docker.com/
- Project README: `/README.md`

