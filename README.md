# ClassCause

## Description

ClassCause is a platform designed to facilitate educational donations, allowing teachers to post wishlists, parents and businesses to donate, and schools to manage and promote donation opportunities. This full-stack application is built with React, Express, MySQL, and uses Knex for query building. It is tested and deployed on Azure.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Running Locally](#running-locally)
- [Testing](#testing)
- [Deployment](#deployment)
- [Usage](#usage)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/classcause.git
   ```
2. Install dependencies for both the frontend (React) and backend (Express):

   ```bash
   cd classcause/client
   npm install
   cd ../server
   npm install
   ```

## Setup

### Environment Variables

Create .env files in both the client and server and server/databse directories:

- Server/.env:

  ```JavaScript
  // Auth
  JWT_SECRET=

  // React App
  FRONTEND_URL=
  PORT=

  // Database configuration
  DB_LOCAL_DBNAME=
  DB_LOCAL_USER=
  DB_LOCAL_PASSWORD=
  DB_LOCAL_PORT=

  BACKEND_URL=

  // notifications config
  SMTP_HOST=
  SMTP_PORT=
  SMTP_SECURE=
  SMTP_USER=
  SMTP_PASS=

  // Stripe secret key
  STRIPE_SECRET=
  STRIPE_WEBHOOK_SECRET=
  ```

- Server/database/.env:

  ```JavaScript
  // DB
  DB_LOCAL_DBNAME=
  DB_LOCAL_USER=
  DB_LOCAL_PASSWORD=
  DB_LOCAL_PORT=
  DB_HOST=
  ```

- Client/.env

  ```JavaScript
  REACT_APP_BACKEND_URL=

  // React App
  REACT_APP_FRONTEND_URL=
  ```

### Database Setup

Using Knex, set up your MySQL database by running the custom script to rollback, migrate and seed the schema:

```bash
cd server
npm run all
```

## Running Locally

To run the server:

```bash
cd server
npm start

# or use nodemon script
npm run dev
```

To run the React client:

```bash
cd client
npm start
```

The application will be available at http://localhost:3000.

## Testing

Run the following command in the server and client directory to execute tests:

```bash
npm test
```

## Deployment

This project is deployed on an Azure Virtual Machine and utilises Azure's managed services. Here’s a detailed step-by-step guide to deploying the application on Azure:

### System Requirements

- **Azure Virtual Machine:** At least Standard B2s (2 vCPUs, 4 GiB RAM).
- **Operating System:** Ubuntu 20.04 LTS.

### Initial Setup

1. **Create and Configure a Virtual Machine:**
   - Log in to the Azure portal at `https://portal.azure.com`.
   - Navigate to "Virtual Machines" and click on "+ Create" to set up a new VM.
   - Choose your subscription and resource group. Assign the VM a name and select the region closest to your user base to minimise latency.
   - Choose the VM sise that fits your needs (Standard B2s recommended for typical scenarios).
   - Set up an administrator account with SSH public key authentication for increased security.
   - Allow selected ports to be accessible over the internet, specifically ports 80 (HTTP) and 443 (HTTPS) for web traffic.

### Software Installation and Configuration

1. **Install Node.js, MySQL, Nginx, and PM2:**

   - Use `apt` package manager to install MySQL Server and secure the installation.
   - Install Node.js and Nginx.
   - Use NPM to install PM2 globally for managing Node.js applications.

### Database Setup

Setting up MySQL involves installing the software, securing the installation, and creating a new database and user specifically for the application.

**_ Install MySQL _**
Install MySQL on the system using the following command:

```bash
sudo apt install mysql-server
```

**_ Secure the Installation and Set the Root Password _**
Run the security script that comes with MySQL. This script removes some insecure default settings and locks down access to your database system. Start the script by running:

```bash
sudo mysql_secure_installation
```

**_ Create the Database and User _**
Set up the database and user account using the following SQL commands:

```sql
CREATE DATABASE classcause_db;
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON classcause_db.* TO 'app_user'@'localhost';
FLUSH PRIVILEGES;
```

### Version Control and Code Deployment

1. **Set Up Git:**

   - Configure Git with your username and email.
   - Generate SSH keys and add the public key to your GitHub account to allow secure connections without password prompts.
   - Clone your project repository into the desired directory on your VM.

2. **Configure Environment Variables:**

   - Create `.env` files on both the client and server sides to manage sensitive configuration settings securely, such as database credentials, API keys, and external service URLs similar to the development setup.

3. **Backend Configuration**

Navigate to the server directory and install necessary Node.js dependencies:

    ```bash
    npm unstall
    npm run all
    ```

4. **Deploy Code with PM2:**

   - Navigate to your server directory and start the application using PM2 to ensure it remains running in the background.
   - Configure PM2 to automatically restart your application in case of crashes.

   ```bash
   pm2  start server.js --name "API Server"
   ```

5. **Configure Nginx:**

   - Set up Nginx as a reverse proxy to direct requests to your Node.js application and serve the static files from your React build.
   - Adjust Nginx configuration to optimise performance and security.

6. **Frontend Configuration**
   Build the application:

   ```bash
   npm run build
   ```

### SSL Configuration with Certbot

- **Secure your Application with HTTPS:**
  - Use Certbot to automatically configure Nginx to use SSL certificates provided by Let's Encrypt.
  - Follow the prompts from Certbot to select your domain and configure SSL settings, which will automatically modify your Nginx configuration to serve the SSL certificate correctly.

### Maintenance and Monitoring

- **Regular Updates and Monitoring:**
  - Regularly update your operating system and all installed packages to secure the latest security patches and improvements.
  - Utilise Azure's monitoring tools to keep track of your VM's performance and resource usage.

By following these detailed steps, your application will be securely deployed on an Azure Virtual Machine, leveraging the robustness and scalability of Azure's cloud infrastructure.

### Stripe Configuration

## Usage And Test Login Credentials

Navigate to the application at [ClassCause](https://classcause.uksouth.cloudapp.azure.com/). Use the various user roles to interact with the system:

- **Teacher**<br>
  Email: alice@example.com<br>
  Password: password
- **School**<br>
  Email: bob@example.com<br>
  Password: password
- **Parent**<br>
  Email: fiona@example.com<br>
  Password: password
- **Business**<br>
  Email: charlie@example.com<br>
  Password: password
- **Admin**<br>
  Email: diana@example.com<br>
  Password: password
