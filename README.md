# ChainCertify

**ChainCertify** is a comprehensive assignment management system that enables students to submit their assignments and quizzes for marking and grading. The system simplifies workflows for both students and instructors, making assignment submissions, reviews, and grading more efficient.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Cloning the Repository](#cloning-the-repository)
  - [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [Docker Support](#docker-support)
- [License](#license)

## Features

- **Student Dashboard:** A platform for students to view, submit, and track assignments and quizzes.
- **Instructor Dashboard:** Allows instructors to manage assignments, review submissions, provide feedback, and assign grades.
- **Submission Status Tracking:** Students can monitor the status of their submissions and see if an assignment has been graded.
- **Grading System:** Instructors can easily grade student submissions, and the grades are visible to students in real-time.
- **Deadline Management:** Displays assignment deadlines and restricts submissions if the deadline has passed.
- **Responsive Design:** Optimized for mobile and desktop use.
- **Role-Based Access:** Students and instructors have role-specific permissions and dashboards.
- **NFT Certificate Minting**: ChainCertify mints certificates as NFTs stored on the Skale Network, giving students verifiable, immutable proof of achievement.

## Technologies Used

ChainCertify is built using the following technologies:

- **Frontend:**

  - [Vite](https://vitejs.dev/) - A fast build tool for modern web development.
  - [TailwindCSS](https://tailwindcss.com/) - A utility-first CSS framework for creating responsive and custom designs easily.

- **Backend:**

  - [Node.js](https://nodejs.org/) - JavaScript runtime for building fast, scalable server applications.
  - [Express](https://expressjs.com/) - Web framework for building REST APIs.
  - [Prisma ORM](https://www.prisma.io/) - A database toolkit that simplifies schema management and database queries.
  - [MySQL](https://www.mysql.com/) - A relational database used to store application data.

- **Blockchain:**

- [Skale Network](https://skale.space/) - A decentralized platform for minting and storing NFTs, ensuring secure and verifiable certificates for students.
- [OpenZeppelin Contracts](https://github.com/peter-mwau/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol) - Used for implementing ERC721 (NFT) functionality, ensuring secure and standardized contract interactions.

## Minting NFT Certificates

- As part of the ChainCertify system, when a student completes a course, an NFT certificate is minted on the Skale Network. This process provides students with a digital certificate that is verifiable, immutable, and easily transferable. The certificate includes key details such as the student's name, institution, course name, and issue date.

- The minting process is handled by the blockchain smart contract ChainCertifyNFT, which issues an ERC721 token (NFT) representing the certificate.

### How It Works:

- `Minting the Certificate`: When a student completes a course, the instructor or system mints an NFT certificate using the student’s details. This process involves generating a unique certID based on the student’s information and course details, which is then stored on the blockchain.

- `Revoking (Burning) the Certificate`: In case of revocation (e.g., if a certificate is issued incorrectly), the owner can revoke the certificate by burning the NFT. This ensures that only valid certificates remain on the blockchain.

- `Storing on the Skale Network`: Certificates are stored on the Skale Network, providing a decentralized and secure system for managing and verifying certificates. The Skale Network allows for fast and cost-effective minting of NFTs, ensuring scalability for large numbers of certificates.

## Getting Started

To get started with running ChainCertify locally, follow the instructions below.

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v14.x or later)
- **npm** (comes with Node.js)
- **MySQL** (local or cloud setup)
- **Git** (to clone the repository)
- **Vite** (for frontend development)
- **Prisma** (for database management)
- **Skale Network** (for NFT minting)
- **OpenZeppelin Contracts** (for ERC721 implementation)
- **Metamask** (for accessing transaction fees)

### Cloning the Repository

Clone the ChainCertify repository:

```bash
git clone https://github.com/peter-mwau/ChainCertify.git
```

### Navigate to the project directory:

```
cd ChainCertify

```

### Installing Dependencies

- Install the required dependencies for both the backend and frontend.

#### 1. Backend Dependencies:

```
cd Backend
npm install
```

#### 2. Frontend Dependencies:

```
cd Frontend
npm install
```

## Running the Application

### 1. Set up MySQL Database:

- Make sure MySQL is running and accessible.
- Create a .env file in the backend directory (details in the Environment Variables section).

### 2. Migrate the Database: Use Prisma to migrate the database schema:

```
npx prisma migrate dev
```

### 3. Start Backend Server: In the backend directory, run:

```
npm srun tart
```

### 4. Start Frontend Server: In the frontend directory, run:

```
npm run dev
```

### 5. Access the Application: Open your browser and navigate to:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

## Environment Variables

- Create a .env file in both the backend & frontend directory with the following values respectively:

```
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/ChainCertify_db"
PORT=8080
JWT_SECRET="your_jwt_secret_key"
```

```
VITE_API_URL="http://localhost:8080"
```

- Replace USER and PASSWORD with your MySQL credentials.

## Docker Support

- ChainCertify will soon be Dockerized to simplify setup and deployment. Once Docker support is integrated, you can run the entire application stack using:

```
docker-compose up
```

### Stay tuned for updates!

## License

- ChainCertify is licensed under the MIT License. Feel free to clone, modify, and distribute as needed.
