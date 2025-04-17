# 📝 Task Tracker

A modern, responsive task management application built with React and Supabase. Manage your tasks with ease, including image attachments and real-time updates.

[Live Demo](https://tracker-theta-woad.vercel.app/)

![Task Tracker Preview](public/preview.png)

## ✨ Features

- **🔐 User Authentication**
  - Email/Password authentication
  - Secure session management

- **📋 Task Management**
  - Create, edit, and delete tasks
  - Mark tasks as complete/incomplete
  - Add descriptions and images to tasks
  - Real-time updates

- **🎨 Modern UI/UX**
  - Clean and intuitive interface
  - Dark/Light theme support
  - Responsive design for all devices
  - Beautiful transitions and animations

- **🖼️ Image Support**
  - Upload images for tasks
  - Image preview in task cards
  - Support for large images (up to 10MB)
  - Image optimization

## 🚀 Technologies

- **Frontend**
  - React
  - TypeScript
  - CSS Modules
  - React Icons

- **Backend & Database**
  - Supabase (Backend as a Service)
  - PostgreSQL Database
  - Real-time subscriptions

- **Deployment**
  - Vercel
  - Supabase Cloud

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/task-tracker.git
   cd task-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📱 Usage

1. **Authentication**
   - Sign up with email and password
   - Verify your email address
   - Login to access your tasks

2. **Managing Tasks**
   - Click the "+" button to create a new task
   - Click on a task to view details
   - Use the task card buttons to edit/delete/complete tasks
   - Upload images by clicking the image upload area

3. **Theme Switching**
   - Click the theme toggle button in the header
   - Choose between light, dark, or system theme

## 🔧 Configuration

### Supabase Setup

1. Create a new project on [Supabase](https://supabase.com)
2. Enable Email authentication
3. Set up the following tables:
   ```sql
   -- todos table
   create table todos (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references auth.users not null,
     title text not null,
     description text,
     completed boolean default false,
     image_url text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Enable RLS
   alter table todos enable row level security;

   -- Create policies
   create policy "Users can view their own todos" on todos
     for select using (auth.uid() = user_id);

   create policy "Users can create their own todos" on todos
     for insert with check (auth.uid() = user_id);

   create policy "Users can update their own todos" on todos
     for update using (auth.uid() = user_id);

   create policy "Users can delete their own todos" on todos
     for delete using (auth.uid() = user_id);
   ```

### Environment Variables

Required environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please open an issue in the repository.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the amazing backend service
- [React](https://reactjs.org/) for the frontend framework
- [Vercel](https://vercel.com/) for hosting
- All the contributors who have helped with code and feedback

---

Made with ❤️ by M1
