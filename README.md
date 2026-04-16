# AudioBook AI 🎧

AudioBook AI is a modern web application that converts any document (PDF, Word, plain text, images) into a professional audiobook, powered by a fully serverless AWS backend.

## 🚀 Features

- **Multi-format Support** — Convert PDF, DOCX, TXT, PNG, and JPG files.
- **Serverless Architecture** — AWS Lambda + API Gateway + S3 + DynamoDB + AWS Polly.
- **S3 Pre-signed URL Upload** — Files go directly to S3 from the browser (no Lambda size limits).
- **Paginated History** — Persistent job history loaded from DynamoDB with a "Load More" pagination control.
- **Cross-tab Sync** — History auto-refreshes every 30 seconds to detect jobs started in other browser tabs.
- **Active Polling** — In-progress jobs are individually polled every 10 seconds for granular status updates.
- **Skeleton Screens** — Smooth loading placeholders while history loads, preventing layout jumps.
- **Shimmer Progress Bar** — Animated indicator on every processing card for any non-terminal status.
- **Audio URL Refresh** — Pre-signed audio URLs are automatically refreshed before playback if they are older than 55 minutes.
- **Integrated Audio Player** — Listen to generated audiobooks directly in the browser.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Styling**: Tailwind CSS
- **Backend**: AWS (API Gateway, Lambda/Python, S3, DynamoDB, Textract, Polly)

## ⚙️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your AWS API Gateway endpoints:

```bash
cp .env.example .env
```

```env
VITE_API_CONVERT_URL=https://<api-id>.execute-api.<region>.amazonaws.com/prod/convert
VITE_API_STATUS_URL=https://<api-id>.execute-api.<region>.amazonaws.com/prod/status
```

### 3. AWS Backend Requirements

**API Gateway / Lambda:**
- `POST /convert` — Accepts `{ fileName, fileType, fileSize }`. Returns `{ uploadUrl, jobId }`.
- `GET /status?jobId=<id>` — Returns a single job's status.
- `GET /status?limit=10&startKey=...&startAt=...` — Returns a paginated job history.

**S3 Bucket CORS** (required for direct browser uploads):
```json
[{
  "AllowedHeaders": ["*"],
  "AllowedMethods": ["PUT", "POST", "GET"],
  "AllowedOrigins": ["*"],
  "ExposedHeaders": []
}]
```

**IAM Role** — The Lambda execution role must include:
```json
{
  "Action": ["dynamodb:Query", "dynamodb:GetItem", "dynamodb:PutItem"],
  "Resource": [
    "arn:aws:dynamodb:<region>:<account>:table/NarratorJobs",
    "arn:aws:dynamodb:<region>:<account>:table/NarratorJobs/index/*"
  ]
}
```

**Python Lambda tip** — DynamoDB returns `Decimal` types. Use a custom encoder before `json.dumps()`:

```python
class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return int(obj) if obj % 1 == 0 else float(obj)
        return super().default(obj)
```

### 4. Run Development Server

```bash
npm run dev
```

## 🏗️ Architecture Flow

```
Browser → POST /convert → Lambda → DynamoDB (create job) + S3 pre-signed URL
Browser → PUT {uploadUrl} → S3 (binary upload)
Browser → GET /status?jobId → Lambda → DynamoDB (poll status)
                                         ↕ (async triggers)
                     S3 → Textract → Lambda → DynamoDB (TEXT_DETECTION_IN_PROGRESS)
                     Textract → Polly → Lambda → DynamoDB (POLLY_IN_PROGRESS)
                     Polly → S3 (mp3 output) → Lambda → DynamoDB (COMPLETED + audioUrl)
```

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ProcessingItem.tsx     # Individual job card with shimmer
│   │   ├── ProcessingList.tsx     # List with skeleton loaders + pagination
│   │   ├── SkeletonItem.tsx       # Loading placeholder card
│   │   ├── StatusBadge.tsx        # Status chip component
│   │   └── ...
├── hooks/
│   └── useProcessingList.ts       # Core state: upload, polling, pagination, sync
├── services/
│   └── audiobook.service.ts       # API abstraction layer
├── types/
│   └── index.ts                   # Shared TypeScript interfaces
└── utils/
    └── fileUtils.ts               # formatBytes() utility
```

## ♿ Accessibility Standards (WCAG 2.1 A)

All UI components follow semantic HTML and ARIA best practices validated through SonarQube:

| Component | Practice Applied |
|---|---|
| `AudioPlayer` | Native `<input type="range">` for seek bar — keyboard and screen-reader friendly |
| `FileUploadZone` | Drop zone implemented as `<button>` — fully keyboard and AT accessible |
| `FilePreview` | `<section aria-label>` instead of `div[role=region]` |
| `ProcessingItem` | Native `<progress>` element for upload indicator |
| `StatusBadge` | Native `<output>` element for live status text |
| `breadcrumb` | `aria-current="page"` + `aria-hidden="true"` without redundant ARIA roles |
| `CardTitle` | `<h4>` with `aria-label` fallback for empty-content edge-case |
| `Table` | `<table>` with `aria-label` + hidden `<caption>` for screen readers |

## 🔍 Code Quality — SonarQube

This project integrates [SonarQube](https://www.sonarsource.com/products/sonarqube/) for static code analysis (bugs, vulnerabilities, code smells, and duplications).

### Prerequisites

- A running SonarQube instance (default: `http://localhost:9000`).
- The `@sonar/scan` CLI installed globally:

```bash
npm install -g @sonar/scan
```

### Setup

Copy the example config and fill in your values:

```bash
cp sonar-project.properties.example sonar-project.properties
```

Edit `sonar-project.properties` with your project key and token (generated in **SonarQube → My Account → Security**):

```properties
sonar.projectKey=AudioBookAPI
sonar.host.url=http://localhost:9000
sonar.token=YOUR_SONARQUBE_TOKEN
```

> ⚠️ `sonar-project.properties` is git-ignored — never commit your token.

### Run Analysis

```bash
npm run sonar
```

Results are available at: **http://localhost:9000/dashboard?id=AudioBookAPI**

---
*Original UI design based on the Audiobook Generator Web App community design.*
