# react-app-basic
This repository contains the code for a full-stack web application, featuring a React front end, a FastAPI back end, and an Nginx reverse proxy for production deployment.

## Project Overview
backend/: A RESTful API built with Python's FastAPI framework. This handles all data processing and database interactions.

frontend/: The user interface built with React and Vite. This application communicates with the back-end API to retrieve and display data.

nginx/: Nginx configuration files that act as a reverse proxy, directing traffic to the appropriate back-end and front-end services.

## Getting Started
Follow these steps to set up and run the project locally.

### 1. Clone the Repository
Clone the project from GitHub and navigate to the project directory.

`git clone https://github.com/divyawebethics/react-app-basic.git`

`cd react-app-basic/assignment_1`

### 2. Frontend Setup
Navigate into the frontend directory and install the required dependencies.
`cd frontend`

`npm install`

`npm run dev`

### 3. Backend Setup
Navigate into the backend directory, create and activate a Python virtual environment, and install the required libraries.

`cd ../backend`

`python3 -m venv venv`

`source venv/bin/activate`

`pip install -r requirements.txt`

`uvicorn main:app --reload`


### 4. Database Setup (PostgreSQL)
Install PostgreSQL and set up the database and a user for your application.

#### Install PostgreSQL and the client tools
`sudo apt update`

`sudo apt install postgresql postgresql-contrib`


#### Check the service status and version
`sudo systemctl status postgresql`

`psql --version`


Now, connect to the postgres user to create a database and a new user for your application.

`sudo -i -u postgres`

`psql`


#### In the psql shell, run these commands:
`ALTER USER postgres WITH PASSWORD 'your_strong_password';`

`CREATE USER your_app_user WITH ENCRYPTED PASSWORD 'your_app_password';`

`CREATE DATABASE person;`

`GRANT ALL PRIVILEGES ON DATABASE person TO your_app_user;`


#### Exit the psql shell
`\q`

### 5. Nginx Server Setup
Install Nginx, which will serve as the reverse proxy.

`sudo apt update`

`sudo apt install nginx`


Once installed, copy the configuration file from your nginx/ directory into /etc/nginx/sites-available/ and create a symbolic link to enable it.

`sudo cp nginx/nginx.conf /etc/nginx/sites-available/your-project.conf (in my case it is test.work)`

`sudo ln -s /etc/nginx/sites-available/your-project.conf /etc/nginx/sites-enabled/`


Finally, test the configuration and reload Nginx to apply the changes.

`sudo nginx -t`

`sudo systemctl reload nginx`

