# TutorBazaar - Complete SaaS Execution Blueprint


A full-stack tutor marketplace platform built with React, Node.js, MongoDB, and Razorpay. Features a credit-based lead generation system for tutors.



## 🚀 Features

### For Students (Public Website)
- **Hero Section** with dual CTA (Find Tutor / Become Tutor)
- **Dynamic SEO Pages** for subjects (Maths, Science, Coding, etc.)
- **City-wise Landing Pages** (Delhi, Mumbai, Bangalore, etc.)
- **Tutor Listing** with filters (city, subject, mode, price)
- **Tutor Profile Pages** with bio, ratings, pricing
- **Step-based Enquiry Flow** (Class → Subject → Budget → Location → Contact)
- **WhatsApp Integration** for instant connection

### For Tutors (Dashboard)
- **Credit-based Lead System** - Pay only for leads you want
- **Real-time Notifications** via Socket.IO
- **Performance Analytics** (conversion rate, response time, ranking)
- **Subscription Plans** (Free, Basic, Premium, Pro)
- **Profile Management** with availability calendar
- **Earnings Dashboard** with lead tracking

### For Admins (Control Center)
- **Overview Dashboard** with MRR, Active Tutors, Revenue Graphs
- **Lead Management** (view, assign, expire, refund)
- **Tutor Approval Workflow**
- **Manual Credit Adjustment**
- **City & Subject Analytics** with heatmaps
- **GST-ready Invoice Generation**

## 🏗️ Architecture

### Tech Stack
| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router 6, Tailwind CSS, Zustand |
| **Backend** | Node.js, Express.js, Socket.IO |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Cache** | Redis (lead matching, sessions) |
| **Payments** | Razorpay (UPI, Cards, Net Banking) |
| **Storage** | Cloudinary (images, documents) |
| **Email** | Nodemailer (SMTP) |

### Database Schema
```
Users (Base)
├── Tutors (Discriminator)
│   ├── subjects[], city, pricing
│   ├── credits { balance, totalPurchased, totalSpent }
│   ├── subscription { plan, startDate, endDate }
│   └── metrics { rankingScore, conversionRate }
├── Students (Discriminator)
│   └── enquiries[], preferences

Leads
├── student { id, name, phone, email }
├── requirements { class, subjects[], city, budget }
├── status: active|locked|converted|expired
└── lockInfo { tutor, lockedAt, expiresAt, creditsDeducted }

CreditTransactions (Audit Trail)
├── tutor, type, amount, balanceAfter
├── relatedLead, relatedPayment
└── transactionId (unique)

Payments (Razorpay)
├── razorpayOrderId, razorpayPaymentId
├── user, amount, status
├── gst { cgst, sgst, igst }
└── invoice { number, url }
```

## 📁 Project Structure

```
TutorBazaar/
├── backend/
│   ├── server.js                 # Entry point
│   ├── src/
│   │   ├── config/              # DB, Redis, Cloudinary
│   │   ├── controllers/         # Route handlers
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # API routes
│   │   ├── middleware/          # Auth, validation, errors
│   │   ├── services/            # Business logic
│   │   │   ├── creditService.js    # Credit transactions
│   │   │   └── paymentService.js   # Razorpay integration
│   │   ├── utils/               # Helpers, email templates
│   │   ├── jobs/                # Cron jobs
│   │   └── socket/              # Real-time handlers
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI
│   │   ├── pages/               # Route components
│   │   │   ├── public/          # Home, FindTutor, Enquiry
│   │   │   ├── tutor/           # Dashboard, Leads, Credits
│   │   │   └── admin/           # Admin dashboard
│   │   ├── context/             # AuthContext
│   │   ├── services/            # API calls
│   │   └── styles/              # Tailwind CSS
│   └── package.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Razorpay account (Test/Live keys)
- Redis (local or cloud)
- Cloudinary account

### 1. Clone & Install

```bash
# Extract the zip file
cd TutorBazaar

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

Create `.env` file in `backend/`:

```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tutorbazaar

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key

# Razorpay (Get from https://dashboard.razorpay.com/)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary (Get from https://cloudinary.com/)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Redis (local or Redis Cloud)
REDIS_URL=redis://localhost:6379

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Credit System
LEAD_UNLOCK_COST=10
MIN_CREDIT_PURCHASE=10
FEATURED_BOOST_COST=50
```

### 3. Database Setup

```bash
cd backend

# Seed default data (subscription plans, admin user)
npm run seed
```

### 4. Razorpay Webhook Setup

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-domain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`, `refund.processed`
4. Set secret and update `RAZORPAY_WEBHOOK_SECRET` in .env

### 5. Run Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/health

## 🔑 Key Features Implementation

### Credit-Based Lead System

The core innovation - tutors purchase credits and spend them to unlock student leads:

```javascript
// Unlock flow (Atomic Transaction)
1. Check tutor approval status
2. Verify sufficient credits (default: 10 credits)
3. Deduct credits from tutor balance
4. Lock lead for 2 hours (exclusive access)
5. Create audit transaction record
6. Notify tutor via Socket.IO
7. Return student contact details
```

**Files:**
- `backend/src/services/creditService.js` - Core logic
- `backend/src/models/CreditTransaction.js` - Audit trail

### Razorpay Payment Integration

Supports UPI, Cards, Net Banking with automatic GST calculation:

```javascript
// Credit Packages
Starter:    50 credits  = ₹500  (₹10/credit)
Popular:   120 credits  = ₹1000 (₹8.33/credit) - Save 17%
Premium:   300 credits  = ₹2000 (₹6.67/credit) - Save 33%
Enterprise: 1000 credits = ₹5000 (₹5/credit)   - Save 50%
```

**Files:**
- `backend/src/services/paymentService.js`
- `backend/src/routes/payment.js` (webhook handler)

### Real-time Notifications

Socket.IO rooms for instant updates:
- Tutor gets notified when new matching lead is posted
- Alert when credit balance is low
- Notification when lead is about to expire

**Files:**
- `backend/src/socket/handler.js`
- `frontend/src/context/SocketContext.js` (create this)

### Automated Jobs

Cron jobs running every hour:
1. **Lead Expiry** - Return expired locks to pool
2. **Ranking Update** - Recalculate tutor scores
3. **Low Credit Alerts** - Email tutors with < 20 credits

**File:** `backend/src/jobs/cronJobs.js`

## 🚀 Deployment

### VPS Deployment (Ubuntu + PM2 + Nginx)

```bash
# 1. Setup server
sudo apt update
sudo apt install nodejs npm nginx redis-server

# 2. Clone repository
git clone <your-repo>
cd TutorBazaar

# 3. Install PM2 globally
sudo npm install -g pm2

# 4. Setup backend
cd backend
npm install --production
pm2 start server.js --name "tutorbazaar-api"

# 5. Setup frontend
cd ../frontend
npm install
npm run build
sudo cp -r build/* /var/www/html/

# 6. Configure Nginx
sudo nano /etc/nginx/sites-available/tutorbazaar
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        root /var/www/html;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/tutorbazaar /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 7. Setup SSL with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Docker Deployment

```dockerfile
# Dockerfile (backend)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=${MONGODB_URI}
    depends_on:
      - redis

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./frontend/build:/usr/share/nginx/html
```

## 📊 API Endpoints

### Authentication
```
POST /api/auth/register          # Register new user
POST /api/auth/login             # Login
POST /api/auth/refresh           # Refresh JWT token
GET  /api/auth/me                # Get current user
```

### Tutor Routes
```
GET  /api/tutors/dashboard       # Dashboard stats
GET  /api/tutors/profile         # Get profile
PUT  /api/tutors/profile         # Update profile
GET  /api/tutors/leads/available # Available leads
GET  /api/tutors/leads/my        # My unlocked leads
POST /api/tutors/leads/:id/unlock # Unlock lead (spend credits)
GET  /api/tutors/credits         # Credit balance & history
POST /api/tutors/credits/purchase # Create Razorpay order
POST /api/tutors/credits/verify  # Verify payment
```

### Student Routes
```
POST /api/students/enquiry       # Create new lead (public)
GET  /api/students/profile       # Get profile (auth)
```

### Admin Routes
```
GET  /api/admin/dashboard        # Admin stats
GET  /api/admin/tutors           # List tutors
PUT  /api/admin/tutors/:id/approve
PUT  /api/admin/tutors/:id/suspend
POST /api/admin/tutors/:id/credits  # Add credits
POST /api/admin/tutors/:id/refund   # Refund credits
GET  /api/admin/leads            # All leads
PUT  /api/admin/leads/:id/status
POST /api/admin/leads/:id/redistribute
```

### Payment Routes
```
POST /api/payments/webhook       # Razorpay webhook
GET  /api/payments/history       # Payment history
GET  /api/payments/invoice/:id   # Generate invoice
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (student, tutor, admin)
- **Rate Limiting** (100 requests/15 min per IP)
- **Helmet.js** for security headers
- **MongoDB Injection Protection** via Mongoose
- **Razorpay Signature Verification** for webhooks
- **CORS** configured for specific origins

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Manual testing with curl
curl -X POST http://localhost:5000/api/auth/register   -H "Content-Type: application/json"   -d '{
    "email": "test@example.com",
    "password": "password123",
    "role": "tutor",
    "firstName": "Test",
    "lastName": "User",
    "city": "Delhi"
  }'
```

## 📈 Scaling Considerations

### Current Optimizations
- Redis caching for lead matching
- Database indexing on frequently queried fields
- Socket.IO for real-time updates (reduces polling)
- Image optimization via Cloudinary

### Future Scaling
- **Microservices**: Separate lead-matching service
- **Queue System**: Bull/Redis for background jobs
- **CDN**: CloudFlare for static assets
- **Read Replicas**: MongoDB replica sets
- **Elasticsearch**: For advanced tutor search

## 🐛 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**
```bash
# Check IP whitelist in MongoDB Atlas
# Ensure MONGODB_URI is correct
```

**2. Razorpay Webhook Not Working**
```bash
# Verify webhook secret matches
# Check ngrok/public URL is accessible
# Review Razorpay webhook logs
```

**3. Redis Connection Error**
```bash
# Start Redis: redis-server
# Or use Redis Cloud for production
```

**4. CORS Errors**
```bash
# Update CLIENT_URL in backend .env
# Ensure ports match (3000 for dev, 80/443 for prod)
```

## 📄 License

MIT License - Feel free to use for commercial projects.

## 🤝 Support

For issues or questions:
1. Check the logs: `backend/logs/combined.log`
2. Review API responses in browser Network tab
3. Verify all environment variables are set
4. Ensure MongoDB, Redis services are running

## 🗺️ Roadmap

- [ ] **Mobile App** (React Native)
- [ ] **AI Recommendation Engine** (matching algorithm)
- [ ] **Video Calling** (WebRTC integration)
- [ ] **White-label SaaS** (multi-tenant architecture)
- [ ] **Advanced Analytics** (churn prediction)
- [ ] **Commission Model** (post-subscription revenue)

---

**Built with ❤️ for the Indian EdTech ecosystem**
