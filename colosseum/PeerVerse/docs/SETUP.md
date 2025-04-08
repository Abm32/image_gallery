# PeerVerse Setup Guide

This guide will help you set up and run the PeerVerse project locally.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask or other Web3 wallet
- Git

## Project Structure

```
peerverse/
├── contracts/           # Smart contracts
│   ├── contracts/      # Solidity contracts
│   ├── test/          # Contract tests
│   └── hardhat.config.ts
├── frontend/          # Next.js frontend
│   ├── app/          # Next.js app directory
│   ├── public/       # Static files
│   └── package.json
├── docs/             # Documentation
└── .env.example      # Environment variables template
```

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/peerverse.git
cd peerverse
```

### 2. Smart Contract Setup

1. Navigate to the contracts directory:
```bash
cd contracts
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your values:
- `PRIVATE_KEY`: Your Ethereum private key
- `SEPOLIA_RPC_URL`: Your Sepolia testnet RPC URL
- `ETHERSCAN_API_KEY`: Your Etherscan API key

5. Compile contracts:
```bash
npx hardhat compile
```

6. Run tests:
```bash
npx hardhat test
```

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```bash
cp ../.env.example .env.local
```

4. Update the `.env.local` file with your values:
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Your WalletConnect project ID
- `NEXT_PUBLIC_CONTRACT_ADDRESS`: Your deployed contract address

5. Start the development server:
```bash
npm run dev
```

## Deployment

### Smart Contract Deployment

1. Deploy to Sepolia testnet:
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia
```

2. Verify the contract on Etherscan:
```bash
npx hardhat verify --network sepolia <contract-address>
```

### Frontend Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to your preferred hosting service (Vercel, Netlify, etc.)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- Never commit your private keys or sensitive information
- Always use environment variables for sensitive data
- Keep your dependencies updated
- Follow security best practices when deploying smart contracts

## Support

For support, please open an issue in the GitHub repository or contact the development team. 