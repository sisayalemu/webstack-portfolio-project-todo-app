# CI/CD Deployment Guide

This document explains how to set up and deploy the Todo application using GitHub Actions and PM2.

## Application Architecture

The Todo application consists of:
- **Backend**: Node.js + TypeScript + Express (Port 3000)
- **Frontend**: React + Vite (Development Port 5173)
- **Database**: MySQL with TypeORM

## Server Setup

### Prerequisites
- Linux server with Ubuntu/Debian
- SSH access
- Node.js 18+ 
- MySQL database
- PM2 process manager

### Installation Commands

```bash
# Update system
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Git (if not already installed)
sudo apt install git -y
```

### Application Setup

```bash
# Create app directory
sudo mkdir -p /var/www/todo-app
sudo chown $USER:$USER /var/www/todo-app

# Clone the repository
cd /var/www/todo-app
git clone https://github.com/YOUR_USERNAME/webstack-portfolio-project-todo-app .

# Install backend dependencies
cd backend
npm install
npm run build

# Install frontend dependencies
cd ../frontend
npm install
npm run build

# Start backend with PM2
cd ../backend
pm2 start dist/index.js --name todo-app-backend
pm2 save
pm2 startup
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=todo_app

# API Key (for frontend communication)
FRONTEND_API_KEY=your-secure-api-key

# Server Port
PORT=3000
```

## CI/CD Pipeline

### GitHub Actions Workflow

The pipeline is configured in `.github/workflows/deploy.yml` and automatically triggers on pushes to the `main` branch.

**What the pipeline does:**
1. Connects to the server via SSH
2. Pulls the latest code from GitHub
3. Installs backend dependencies and builds the TypeScript code
4. Installs frontend dependencies and builds the React app
5. Restarts the backend service with PM2

### Required GitHub Secrets

In your GitHub repository settings, configure these secrets:

| Secret | Description |
|--------|-------------|
| `SERVER_HOST` | Server IP address |
| `SERVER_USER` | SSH username |
| `SERVER_SSH_KEY` | SSH private key (without passphrase) |

### Setting up SSH Key

1. Generate SSH key on your local machine:
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions"
```

2. Add the public key to the server:
```bash
cat ~/.ssh/id_rsa_github.pub >> ~/.ssh/authorized_keys
```

3. Add the private key to GitHub secrets:
```bash
cat ~/.ssh/id_rsa_github
```

## Nginx Configuration (Optional)

To serve the application with a custom domain:

### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Create Nginx Configuration

Create `/etc/nginx/sites-available/todo-app`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    location / {
        root /var/www/todo-app/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
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

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/todo-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Troubleshooting

### Common Issues

1. **Pipeline fails with SSH error**
   - Check that SSH key has no passphrase
   - Verify server permissions and paths
   - Ensure GitHub secrets are correctly configured

2. **Backend doesn't start**
   - Check PM2 logs: `pm2 logs todo-app-backend`
   - Verify environment variables in `.env` file
   - Ensure database is running and accessible

3. **Frontend build fails**
   - Check Node.js version (requires 18+)
   - Clear npm cache: `npm cache clean --force`
   - Delete `node_modules` and reinstall

4. **Database connection issues**
   - Verify MySQL is running: `sudo systemctl status mysql`
   - Check database credentials in `.env`
   - Ensure database exists and user has permissions

### Useful Commands

```bash
# Check PM2 status
pm2 status

# View application logs
pm2 logs todo-app-backend

# Restart application
pm2 restart todo-app-backend

# Check nginx configuration
sudo nginx -t

# View nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test database connection
mysql -u username -p -h localhost database_name
```

## Deployment Verification

After setting up the pipeline:

1. Make a small change to the application
2. Commit and push to main branch
3. Check GitHub Actions for successful deployment
4. Verify changes appear on the live server
5. Test application functionality

## Security Notes

- Never commit sensitive information (passwords, API keys) to the repository
- Use GitHub secrets for all sensitive configuration
- Regularly update dependencies to patch security vulnerabilities
- Consider using HTTPS with SSL certificates for production

## Monitoring

- Use PM2 monitoring: `pm2 monit`
- Set up log rotation for PM2 logs
- Monitor server resources (CPU, memory, disk space)
- Consider setting up uptime monitoring for the application
