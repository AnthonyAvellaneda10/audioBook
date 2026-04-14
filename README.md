# AudioBook AI 🎧

AudioBook AI is a modern web application that converts documents (PDF, PNG, JPG, TXT) into professional audiobooks using a serverless AWS architecture.

## 🚀 Features

- **Multi-format Support**: Convert PDF, Images, and Text files.
- **Serverless Architecture**: Scalable backend using AWS Lambda and API Gateway.
- **S3 Pre-signed URLs**: Secure, direct-to-S3 uploads for handling large files without Lambda timeouts.
- **Real-time Feedback**: Granular tracking of processing states (Uploading, Processing text, Generating audio).
- **Integrated Player**: Listen to your generated audiobooks directly in the app.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TypeScript.
- **Animations**: Framer Motion.
- **Icons**: Lucide React.
- **Backend**: AWS Serverless (Lambda, S3, Polly/TTS).

## ⚙️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in your API endpoints:
   ```bash
   cp .env.example .env
   ```

3. **Backend Requirements**:
   - Ensure your Lambda function handles `fileName` and `fileType` in the POST body.
   - S3 Bucket must have CORS configured to allow `PUT` requests from your frontend origin.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture Flow

1. **Convert Request**: Frontend sends metadata to API Gateway.
2. **Pre-signed URL**: Lambda generates a secure S3 PUT URL and a unique Job ID.
3. **S3 Upload**: Frontend uploads the binary file directly to S3.
4. **Processing**: AWS triggers document analysis and TTS generation.
5. **Polling**: Frontend polls the status endpoint every 10 seconds until completion.
6. **Delivery**: Audiobook is served via a secure S3 URL for playback.

## ✨ Clean Code Patterns

The project follows a modular structure:
- **Services**: Abstracted API logic.
- **Hooks**: Scalable state management and side effects.
- **Components**: Atomic and reusable UI components with focus on accessibility and aesthetics.

---

*Original UI design based on the Audiobook Generator Web App community design.*