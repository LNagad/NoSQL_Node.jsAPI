# NodeAPI

This is a project for a REST API created with Node.js, using JWToken for authentication and error handling middleware for various scenarios, with the goal of communicating with a frontend client.

## Features

- Implementation of a REST API with Node.js
- Authentication using JWToken
- Error handling middleware for various scenarios
- Communication with a frontend client

## Requirements

Before running the project, make sure you have the following components installed:

- Node.js: version 14.x or higher
- MongoDB: version 4.x or higher

## Installation

1. Clone this repository to your local machine.
git clone https://github.com/your_username/nodeApi.git
2. Navigate to the project folder.
cd nodeApi

3. Install the project dependencies.
npm install

4. Configure the MongoDB connection in the project `.env` file.
PORT = 
DB_URL = 

5. Start the server.
npm start

The server will run on the default port 3000. You can access the REST API via `http://localhost:3000` in your browser or in your frontend client.

## Usage

The REST API provides the following routes:

- `GET /feed/posts`: Get all posts.
- `GET /feed/post/:postId`: Get a post by post ID.
- `POST /feed/post`: Create a new post.
- `PUT /feed/post/:postId`: Update an existing post by post ID.
- `DELETE /auth/post/:postId`: Delete a post by post ID.
- `POST /auth/signup`: Sign up as a new user.
- `POST /auth/login`: Log in as an existing user.

Make sure to include the authentication token in the headers of requests that require authentication. You can obtain the authentication token by signing up or logging in as a user.

## Contribution

If you wish to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch for your contribution.
3. Make your changes and local tests.
4. Send a pull request to the main branch of the repository.
5. Make sure to include a clear and detailed description of your changes.

## Contact

If you have any questions or suggestions, please contact me at [maycoldpc@gmail.com](mailto:maycoldpc@gmail.com).
