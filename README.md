# BeyondGPA 

BeyondGPA connects students with professors for undergraduate research projects and internships by showcasing student skills through personal and club projects. The platform allows students to upload project details and search for URPs that match their skills. It utilizes technologies like NextJS, Prisma, and PostgreSQL for its frontend and backend development.

For more information:

See the:
- [Notion Page](https://mercerxlab.notion.site/mercer-x-beyond-gpa)
- [GitHub](https://github.com/rpi-mercerxlab/BeyondGPA)
- Or contact: [Cooper Werner (wernec6@rpi.edu)](mailto:wernec6@rpi.edu) or [Dr. Shayla Sawyer (sawyes@rpi.edu)](mailto:sawyes@rpi.edu)


## Setting Up Development Environment

### Dependencies

BeyondGPA relies on the following dependencies:

1. Docker
    - Used to run the minio and postgres databases for file and structured data storage
    - [Install Docker Here](https://www.docker.com/get-started/)
2. NodeJS 24.12.0
    - The latest LTS version of NodeJS, use either NVM or install directly
    - [Node Version Manager (NVM) for Linux/Mac](https://github.com/nvm-sh/nvm)
    - [NodeJS for Windows](https://nodejs.org/en/download)
3. A handful of NPM packages:
    - NextJS 15
    - Prisma
    - Tailwind
    - NextAuth
    - TipTap (Rich Text Editor)

### Setting Up

1. Install Docker and NodeJS from the links above
2. Clone the source code from the GitHub repository

        git clone --depth=1 https://github.com/rpi-mercerxlab/BeyondGPA

3. Open the repository in VSCode
4. Copy the `.env.example` file and rename the copy to `.env`
5. Modify the `.env` file have the desired values (you can leave them as is for a development environment)
6. Run the following command to start the database and web server: 

        docker compose up


**Congratulations!** The app is now available at [localhost:3000](http://localhost:3000)

To stop running the server (don't worry all data will be preserved):

        docker compose down

### Using the NextJS Live Server

The NextJS Live Server allows us to modify the UI and backend and see those changes reflected on our machines live instead of having to rebuild the docker image each time. To do this:

1. Install the NPM dependencies locally. With the BeyondGPA app as the working directory run the following:
        
        npm install

2. Spin up all the containers:
        
        docker compose up

3. Then stop the container running the app so that we can replace it with the live server

        docker kill beyondgpa-app-1

4. Modify the `.env` file to so that the database URL goes from:

       postgresql://user:password@database:5432/database -> postgresql://user:password@localhost:5432/database

    - This allows us to access the database outside the docker container. If you want to run the app from the docker image again, you will have to change the line back.

5. Run the NextJS live server:
    
        npm run dev


