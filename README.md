# Connectly

A simple social media web application I created as part of my CodeAlpha Full Stack Development internship.

## About the Project

Connectly is a mini social media platform where users can create an account, create posts, like and comment on posts, follow other users, and view profiles.

## Features

* User registration and login
* User profiles
* Create, edit and delete posts
* Like and unlike posts
* Add and delete comments
* Follow and unfollow users
* Search users
* Notifications
* Home feed
* Light and dark mode
* Responsive design for mobile and desktop

## Technologies Used

* HTML
* CSS
* JavaScript
* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs

## Project Structure

```text
CodeAlpha_SocialMediaPlatform/
├── backend/
├── frontend/
├── README.md
└── .gitignore
```

* `frontend` contains the HTML, CSS and JavaScript files.
* `backend` contains the Express server, APIs, models and routes.

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/patrapillivasanthsai/CodeAlpha_SocialMediaPlatform.git
   ```

2. Open the project folder:
   ```bash
   cd CodeAlpha_SocialMediaPlatform
   ```

3. Go to the `backend` folder:
   ```bash
   cd backend
   ```

4. Install backend dependencies:
   ```bash
   npm install
   ```

5. Create a `.env` file in the `backend` folder using `.env.example` as a template:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

6. Start the server:
   ```bash
   npm start
   ```

7. Open your browser and go to `http://localhost:5000`.

## Database

MongoDB is used to store data for users, posts, comments, likes, follow relationships, and notifications.

## What I Learned

During this project, I learned how to:

* Create REST APIs using Node.js and Express.js
* Connect a frontend made with HTML, CSS, and Vanilla JavaScript to an Express backend
* Work with MongoDB databases and Mongoose schemas
* Implement user authentication using JWT and password hashing with bcryptjs
* Manage environment variables safely using `.env`
* Use Git and GitHub for version control

## Project

GitHub:
https://github.com/patrapillivasanthsai/CodeAlpha_SocialMediaPlatform
