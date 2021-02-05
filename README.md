# 1. A web server and HTTP requests using Node.js
### Task:
Create a simple node.js server and examples of get and post requests.

# 2. Authorization. Reading and writing files
### Task:
Modify the server created on step 1:
1. The server should greet a user only if he/she sends the POST request with a custom header *(IKnowYourSecret: TheOwlsAreNotWhatTheySeem)*
2. Write all successfully authorised users (name and IP) to the file
3. For each new start of the server read the previous state from the file

# 3. Express
### Task:
Rewrite the server using Express framework.

# 4. Docker & MongoDB
### Task:
Run MongoDB as a Docker container. Rewrite existing names' storage with Mongo + Mongoose.

# 5. Passport.js LocalStrategy, BearerStrategy
### Tasks:
1. Apply passport.js LocalStrategy for user authentication by login and password.

2. In case of success authentication create a JWT for authenticated user and store it among other fields of the user.

3. Apply passport.js BearerStrategy to any API endpoint in order to validate JWT.