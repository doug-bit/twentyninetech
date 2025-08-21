# Maya-29 AI Image Generator

A Node.js wrapper application for the Replicate API featuring an ultra-minimal interface designed for LED wall display. Uses the authentic Maya-29 model for generating high-quality images in 3:4 aspect ratio.

## Features

- **Authentic Maya-29 Model**: Uses the genuine mayaman/maya-29 model with exact schema parameters
- **LED Wall Optimized**: 3:4 aspect ratio perfect for 1.5m x 2m LED panels
- **PNG Format**: High-quality PNG output for maximum LED wall compatibility
- **Automatic Download**: Every generated image is automatically downloaded with MM29- prefix
- **Futuristic Design**: Sleek streetwear aesthetic with tech-inspired UI
- **Kiosk Mode**: Designed for continuous public use with auto-reset functionality
- **15-Second Display**: Images stay visible for 15 seconds before auto-reset

## Tech Stack

- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js with TypeScript
- **UI Components**: shadcn/ui built on Radix UI
- **Styling**: Tailwind CSS with custom design tokens
- **Database**: PostgreSQL with Drizzle ORM (Neon Database)
- **AI Integration**: Replicate API with Maya-29 model
- **State Management**: TanStack Query for server state

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon Database account)
- Replicate API account and token

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/maya-29-generator.git
   cd maya-29-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   REPLICATE_API_TOKEN=your_replicate_api_token_here
   DATABASE_URL=your_postgresql_database_url_here
   BASE_PATH=/mayamann
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5000`

## Deployment

### Replit Deployment (Recommended)

1. Import this repository to Replit
2. Set environment variables in Replit Secrets:
   - `REPLICATE_API_TOKEN`
   - `DATABASE_URL` 
3. Run the project
4. Deploy to `twentynine.technology/mayamann`

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /api/generate` - Generate new image with Maya-29 model
- `GET /api/images/:filename` - Serve generated images
- `GET /api/download/:filename` - Download image with MM29- prefix
- `GET /api/images/count` - Get total image count

## Maya-29 Model Configuration

The application uses authentic Maya-29 model parameters:

- **Model**: `mayaman/maya-29` (dev version)
- **Inference Steps**: 28 (optimized for dev model)
- **Guidance Scale**: 3 (balanced realism)
- **Aspect Ratio**: 3:4 (LED wall compatible)
- **Output Format**: PNG (maximum compatibility)
- **Output Quality**: 90 (high quality for display)

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage interface
├── shared/                 # Shared types and schemas
├── generated_images/       # Generated image storage
└── drizzle.config.ts      # Database configuration
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REPLICATE_API_TOKEN` | Your Replicate API token | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `BASE_PATH` | Base path for deployment (default: '') | No |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Maya-29 model by mayaman on Replicate
- Built for LED wall display at twentynine.technology
- Designed for continuous kiosk operation

## Support

For support, please open an issue in the GitHub repository or contact the development team.