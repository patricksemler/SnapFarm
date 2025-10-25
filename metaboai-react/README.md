# SnapFarm - AI Plant Disease Diagnosis

A fully client-side React app for instant AI-powered plant disease diagnosis. Built for hackathons with advanced AI architecture and sustainable farming focus.

## 🚀 Features

- **🔐 User Authentication**: Physical file-based authentication with email/password and auto-login
- **🤖 AI Disease Detection**: TensorFlow.js with MobileNetV3 for plant leaf classification
- **📱 Advanced Technology**: Cutting-edge browser-based AI with fast inference
- **🌱 Sustainable Focus**: Eco-friendly treatment recommendations and impact tracking
- **💬 Smart Chat Assistant**: Context-aware AI with dashboard statistics integration
- **📊 Advanced Dashboard**: Disease tracking, environmental metrics, and sustainability impact
- **🌙 Dark Mode**: Full dark/light theme support with system preference detection
- **📋 Additional Data Collection**: Soil pH, temperature, humidity, and environmental tracking
- **☁️ Cloud Storage**: Firebase Firestore for user data synchronization
- **🎨 Modern UI**: Beautiful gradients, glass morphism, and smooth animations
- **📱 PWA Ready**: Installable progressive web app with modern capabilities

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Authentication**: Physical file-based system (data/users.json)
- **Database**: Local JSON files with localStorage fallback
- **AI/ML**: TensorFlow.js + MobileNetV3
- **Charts**: react-chartjs-2 + Chart.js
- **Icons**: Lucide React (replacing emojis)
- **Storage**: Firebase + LocalStorage fallback + Service Worker caching
- **Themes**: Dark/Light mode with system detection
- **Build**: Vite + PWA plugin
- **Deployment**: Vercel-ready static build

## 🔧 Quick Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase config

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Authentication System

The app uses a **physical file-based authentication system**:

- **User Data**: Stored in `data/users.json` 
- **Sessions**: Managed in `data/sessions.json`
- **Auto-Login**: Users are automatically logged in after successful signup
- **Email Validation**: Clear error messages for non-existent emails
- **Password Security**: SHA-256 hashing with salt

**Verification**: Run `node verify-auth.js` to check the file system setup.

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ImageUpload.tsx   # Drag & drop image upload
│   ├── Inference.tsx     # TensorFlow.js inference engine
│   ├── ResultsCard.tsx   # Disease results with recommendations
│   ├── Dashboard.tsx     # Analytics dashboard
│   └── ChatAssistant.tsx # AI chat with offline fallback
├── utils/               # Helper functions
│   ├── imageProcessing.ts # Canvas API preprocessing
│   ├── inference.ts      # TensorFlow.js model handling
│   ├── storage.ts        # LocalStorage management
│   └── diseaseMapping.ts # Disease info & recommendations
├── types/               # TypeScript definitions
└── App.tsx             # Main application
```

## 🤖 Model Integration

### 1. Prepare Your Model

Convert your trained model to TensorFlow.js format:

```bash
# If you have a Python model
tensorflowjs_converter \
  --input_format=tf_saved_model \
  --output_format=tfjs_graph_model \
  --signature_name=serving_default \
  --saved_model_tags=serve \
  ./saved_model \
  ./public/models/mobilenetv3
```

### 2. Place Model Files

```
public/
└── models/
    └── mobilenetv3/
        ├── model.json      # Model architecture
        └── weights.bin     # Model weights
```

### 3. Update Class Names

Edit `src/utils/inference.ts`:

```typescript
const CLASS_NAMES = ['Healthy', 'Blight', 'Leaf Curl', 'Mosaic Virus'];
// Update with your actual class names
```

### 4. Customize Disease Mapping

Edit `src/utils/diseaseMapping.ts` to add your disease information:

```typescript
export const DISEASE_MAPPING: Record<string, DiseaseInfo> = {
  'YourDiseaseName': {
    name: 'Display Name',
    severity: 'high',
    environmentalConditions: { /* ... */ },
    recommendations: ['Treatment 1', 'Treatment 2'],
    sustainableActions: ['Eco action 1', 'Eco action 2'],
    reason: 'Why this disease occurs'
  }
};
```

## 🎯 Key Components Usage

### ImageUpload Component
```tsx
<ImageUpload 
  onImageSelect={(file) => setSelectedImage(file)}
  isProcessing={isLoading}
/>
```

### Inference Engine
```tsx
<Inference
  imageFile={selectedImage}
  onResults={(predictions, imageUrl) => handleResults(predictions, imageUrl)}
  onError={(error) => handleError(error)}
/>
```

### Results Display
```tsx
<ResultsCard
  predictions={predictions}
  imageUrl={processedImageUrl}
  onSave={(result) => saveDiagnosis(result)}
/>
```

## 📊 Dashboard Features

- **Disease Frequency**: Bar chart of diagnosis distribution
- **Health Ratio**: Doughnut chart of healthy vs diseased plants
- **Sustainability Metrics**: Water saved, pesticides avoided
- **Recent Diagnoses**: Timeline of latest results

## 💬 Chat Assistant

- **Online Mode**: Ready for GPT API integration
- **Offline Mode**: 200+ pre-programmed Q&A responses
- **Topics**: Watering, fertilizing, pruning, pest control, disease prevention

### Adding GPT Integration

Update `src/components/ChatAssistant.tsx`:

```typescript
// Replace the offline response with API call
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: userMessage.content,
    context: 'plant farming expert'
  })
});
```

## 🔄 Offline Functionality

The app caches:
- ✅ Static assets (JS, CSS, images)
- ✅ TensorFlow.js model files
- ✅ App shell for offline navigation
- ✅ Diagnosis history in LocalStorage
- ✅ Chat history with offline responses

## 🌱 Sustainability Features

- **Water Conservation**: Track irrigation savings
- **Pesticide Reduction**: Monitor chemical avoidance
- **Organic Recommendations**: Prioritize eco-friendly treatments
- **Impact Dashboard**: Visualize environmental benefits

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Build and deploy
npm run build
npx vercel --prod
```

### Manual Deployment
```bash
# Build static files
npm run build

# Deploy dist/ folder to any static host
# (Netlify, GitHub Pages, AWS S3, etc.)
```

## 🔧 Environment Variables

Create `.env.local` for API keys:

```env
VITE_GPT_API_KEY=your_openai_key_here
VITE_API_BASE_URL=https://api.openai.com/v1
```

## 📱 PWA Installation

The app automatically prompts users to install as a PWA. Features:
- Offline functionality
- Native app-like experience
- Push notifications (ready for implementation)
- Background sync for data

## 🐛 Troubleshooting

### Model Loading Issues
- Ensure model files are in `public/models/mobilenetv3/`
- Check browser console for CORS errors
- Verify model.json format matches TensorFlow.js requirements

### Performance Optimization
- Model files are cached aggressively
- Images are resized to 224x224 before inference
- Components use React.memo for re-render optimization

### Offline Issues
- Check Service Worker registration in DevTools
- Verify cache storage in Application tab
- Test offline mode by disabling network

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - feel free to use in hackathons and personal projects!

## 🏆 Hackathon Ready

This codebase is optimized for rapid development:
- ⚡ 5-minute setup with `npm install && npm run dev`
- 🔧 Modular components for easy customization
- 📝 Clear documentation and code comments
- 🎨 Professional UI with TailwindCSS
- 🚀 Production-ready build system

Perfect for agriculture, sustainability, or AI-focused hackathons!

---

Built with ❤️ for sustainable farming and AI innovation.