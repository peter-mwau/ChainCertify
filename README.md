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

## Blockchain Integration

- ChainCertify integrates blockchain technology to process certificates for users as NFTs using the Skale Titan Hub network. Each certificate is saved on-chain, ensuring immutability and security. Additionally, a copy of the certificate details is saved in the database for easy access and management.
- This blockchain-based approach enhances the credibility and transparency of certifications, creating an unalterable record of achievement for students and professionals.

## Why Skale Network?

- The Skale Network was chosen for its unique benefits that align with ChainCertify’s goals of efficiency, scalability, and accessibility. Key advantages of the Skale Network include:

- **`Zero Gas Fees`**: Unlike most blockchain networks, Skale offers zero transaction fees, allowing ChainCertify to issue certificates without additional costs to the students or institutions. This makes the platform especially viable for educational institutions, as it removes the financial barrier often associated with blockchain technology.
- **`Enhanced Scalability`**: The Skale Network supports a high volume of transactions, making it suitable for large-scale academic institutions that may require certificate issuance in bulk.
- **`File Storage Layer`**: Skale’s file storage capability allows ChainCertify to store certificate metadata and related files on-chain securely and efficiently. This layer complements the NFT certificate issuance, enabling long-term, tamper-proof storage of certificate details and adding another level of security.

## How It Works

1. **`Certificate Minting as NFTs`**: When a student completes a course, ChainCertify mints a unique ERC721 token, or NFT, on the Skale Network. This certificate includes essential details, such as the student’s name, course title, and issue date. Minting the certificate as an NFT provides an official and verifiable record of completion.

2. `**Revocation and Certificate Updates**`: If needed, certificates can be revoked by burning the NFT, ensuring only valid and up-to-date certificates remain accessible on the blockchain. Additionally, the flexibility of the NFT standard allows ChainCertify to implement future upgrades, such as metadata updates, if policies or course information evolve.

3. `**Permanent, Verifiable Storage**`: All minted certificates are stored on the Skale blockchain, providing a decentralized, transparent ledger that anyone can access for verification purposes. This is especially beneficial for employers or third parties who may wish to validate an individual's qualifications without relying on centralized systems.

## Project Importance, Scope, and Future Improvements

- The importance of ChainCertify lies in its potential to be upgraded and utilized as a Software as a Service (SaaS) model. Learning Management Systems (LMS) can connect to ChainCertify through a subscription model to manage assignments, quizzes, projects, grading, and certificate issuance.
- ChainCertify aims to revolutionize the certification process by providing an innovative SaaS solution for educational institutions, corporations, and individuals looking to securely manage, verify, and share academic and professional achievements.

## Vision: Towards a Comprehensive SaaS Model

- As ChainCertify develops, the vision is to offer a fully realized Software as a Service (SaaS) model that will allow educational institutions, corporate training programs, and other organizations to integrate ChainCertify seamlessly into their existing Learning Management Systems (LMS) or as a standalone service.
- In this SaaS model, institutions would have subscription-based access to ChainCertify’s powerful features without needing to develop their own certificate and assignment management capabilities.

## Planned Benefits of the SaaS Model:

- `**Ease of Integration**`: Institutions can connect their LMS to ChainCertify via a subscription, providing access to assignment and grading workflows, as well as blockchain certificate issuance.
- `**Cost-Effectiveness**`: The SaaS model reduces development costs for institutions by allowing them to utilize ChainCertify’s platform without incurring extensive internal development expenses.
- `**Customizable Subscriptions**`: Institutions can select from various subscription levels based on their needs, allowing them to scale usage and features as they grow.
- `**Continuous Updates and Improvements**`: With ChainCertify as a SaaS, institutions automatically benefit from platform updates and new features, ensuring they always have access to the latest advancements in assignment management and certificate issuance.

## Project Scope and Future Enhancements

- ChainCertify envisions expanding beyond simple assignment and grading functionalities into a comprehensive academic management system. Potential future enhancements include:

- `**AI-Powered Grading Assistance**`: Implementing AI to assist instructors in grading assignments, saving time and ensuring grading consistency.
- `**Cross-Institution Certification Network**`: By expanding ChainCertify’s user base, multiple institutions could join a single, unified platform, where students can access, share, and verify certificates across institutions seamlessly.
- `**Broader Skill and Credential Verification**`: Beyond academia, ChainCertify can extend to professional certifications, skill verification for corporate training, and other credentials, establishing a secure standard for lifelong learning and career development.
- `**Enhanced Data Analytics**`: Providing institutions with insights and analytics on student performance, engagement, and learning progress, aiding in curriculum development and personalized education.
- `**Mobile and Offline Capabilities**`: Development of a mobile application and offline features to ensure accessibility in regions with limited internet connectivity.
- `**Multi-Network Support**`: In the future, ChainCertify could support other blockchain networks, allowing institutions the flexibility to choose a network that aligns with their needs.

## Docker Support

- ChainCertify will soon be Dockerized to simplify setup and deployment. Once Docker support is integrated, you can run the entire application stack using:

```
docker-compose up
```

### Stay tuned for updates!

## License

- ChainCertify is licensed under the MIT License. Feel free to clone, modify, and distribute as needed.
