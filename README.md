# LinkedIn Clone - Next.js 14

A modern LinkedIn clone built with Next.js 14, featuring real-time updates, authentication, and a rich social media experience.

## Demo Video

https://github.com/user-attachments/assets/cad5bb59-c01d-4e9d-b3ab-84a12a199d3b

## Features

### Core Functionality
- **User Authentication** - Secure authentication powered by Clerk
- **Post Creation** - Create posts with text, images, or videos
- **Emoji Support** - Add emojis to posts and comments
- **Comments** - Engage with posts through comments
- **Likes** - Like posts and see engagement metrics
- **Repost System** - LinkedIn-style reposting with two options:
  - Repost with your thoughts
  - Direct repost
- **File Uploads** - Upload images and videos to posts
- **User Profiles** - View user information and post history
- **Responsive Design** - Fully responsive UI that works on all devices

## Tech Stack

### Frontend
- **Next.js 14.2.2** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide Icons** - Modern icon library
- **emoji-picker-react** - Emoji picker component

### Backend & Database
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - ODM for MongoDB
- **Supabase Storage** - Cloud storage for images and videos

### Authentication
- **Clerk** - Complete authentication solution with user management

### Additional Tools
- **React Timeago** - Time formatting
- **Sonner** - Beautiful toast notifications

## Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Supabase account for file storage
- Clerk account for authentication

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd linkedin-clone-nextjs-14
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables (see above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Post.tsx          # Individual post component
│   ├── PostForm.tsx      # Create post form
│   ├── PostFeed.tsx      # Feed of posts
│   ├── CommentForm.tsx   # Comment input
│   ├── RepostModal.tsx   # Repost options modal
│   ├── Header.tsx        # Navigation header
│   └── ui/               # shadcn/ui components
├── actions/              # Server Actions
│   ├── createPostAction.ts
│   ├── createCommentAction.ts
│   ├── repostActions.ts
│   └── ...
├── mongodb/              # Database configuration
│   ├── db.ts            # MongoDB connection
│   └── models/          # Mongoose models
│       └── post.ts      # Post model
└── lib/                 # Utility functions
```

## Key Features Explained

### Repost System
The repost feature works similarly to LinkedIn:
- **Repost with thoughts**: Add your own commentary to the original post
- **Direct repost**: Share the original post as-is

### File Upload
Users can upload:
- Single image per post
- Single video per post
- Stored securely in Supabase Storage

### Real-time Updates
- Posts appear instantly after creation
- Comments update in real-time
- Like counts reflect immediately

## Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

### Deploy on Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
This app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS
- Digital Ocean

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Authentication by [Clerk](https://clerk.com/)
- Database hosted on [MongoDB Atlas](https://www.mongodb.com/atlas)
- File storage by [Supabase](https://supabase.com/)

---

**Note:** This is a learning project and clone of LinkedIn for educational purposes only.
