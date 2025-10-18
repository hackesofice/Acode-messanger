# Messenger Ax - Acode Plugin

A feature-rich, real-time messaging plugin for Acode editor that allows you to chat with other users while coding. Built with modern UI design and real-time WebSocket communication.

> note this plugin is fully open source at [hear](https://github.com/hackesofice/Acode-messanger.git) and it usage [**Chat-API** as backend which is also open source at hear](https://github.com/offiicialkamal/Chat-API.git)

##### Develomemt is in progress .....

![Messenger Ax](https://img.shields.io/badge/Acode-Plugin-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-green)
![downloads](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Facode.app%2Fapi%2Fplugin%2Fhackesofice.messanger_ax&query=downloads&style=for-the-badge&label=Downloads&labelColor=363a4f&color=c084fc&logo=download)

## BACKEND INFORMATION

this plugin usage [this repository](https://github.com/offiicialkamal/Chat-API.git) which is written in FastAPI (python)

## ✨ Features

### 🔐 Authentication & Security
- **Secure Login/Logout** with session management
- **User Registration** with email verification
- **OTP Verification** for account security
- **Password Reset** functionality
- **Auto-login** with cookie-based sessions
- **Safe message encoding/decoding**

### 💬 Messaging
- **Real-time messaging** via WebSocket
- **Group chats** and direct messages
- **Typing indicators**
- **Message timestamps**
- **Online/Offline status**
- **Message history** persistence

### 🎨 User Interface
- **Modern Dark Theme** with customizable colors
- **Smooth Animations** and transitions
- **Responsive Design** for mobile and desktop
- **Intuitive Chat Interface**
- **Custom Avatars** and user profiles
- **Search functionality** for users and chats

### 👤 Profile Management
- **Edit personal information**
- **Change password**
- **Update profile picture**
- **Theme preferences**
- **Notification settings**

### 🔧 Technical Features
- **Offline Support** with network detection
- **Automatic Reconnection** for WebSocket
- **Error Handling** with user-friendly messages
- **Loading States** and progress indicators
- **Cross-platform compatibility**

## 🚀 Installation

1. Open **Acode Editor**
2. Go to **Settings** → **Plugins**
3. Search for **"Messenger Ax"**
4. Click **Install**
5. Restart Acode

## 📱 Usage

### Getting Started
1. After installation, click on the **Messenger icon** in the sidebar
2. **Create an account** or **login** if you already have one
3. Verify your email with the **OTP code** sent to your inbox
4. Start chatting!

### Basic Functions
- **Start New Chat**: Click the "New Chat" button and search for users
- **Send Messages**: Type in the message input and press Enter or click Send
- **View Profile**: Click on your profile picture in the sidebar
- **Search Chats**: Use the search bar to find specific conversations

### Chat Features
- **Real-time Updates**: See messages instantly as they arrive
- **Typing Indicators**: Know when someone is typing
- **Message Status**: See when messages were sent
- **Chat History**: Access previous conversations

## 🛠️ Configuration for contributors

### Server Configuration
The plugin connects to a messaging server. Default server URL is:
```
http://fi5.bot-hosting.net:22148

```

To change the server URL, modify the `SERVER_URL` constant in the plugin code.

### Theme Customization
The plugin uses CSS variables for theming. You can customize:
- Primary colors
- Background colors
- Text colors
- Accent colors

## 🔌 API Endpoints

The plugin uses the following server endpoints:

### Authentication
- `POST /login` - User login
- `POST /sign_up` - User registration
- `POST /account_verification` - OTP verification
- `POST /resend_otp` - Resend verification code
- `POST /get_token` - Session token validation
- `POST /forgot_password` - Password reset request
- `POST /reset_password` - Password reset

### Messaging
- `POST /get_old_messages` - Fetch message history
- `POST /get_all_users` - Get user list
- `WebSocket /ws` - Real-time messaging

### Profile
- `POST /get_settings_data` - Get user profile
- `PATCH /get_settings_data` - Update user profile

## 🎨 UI Components

### Message Bubbles
- **Sent messages** appear on the right with primary color
- **Received messages** appear on the left with surface color
- **Timestamps** show relative time (now, 2m ago, 1h ago)

### Loading States
- **Button loaders** for form submissions
- **Content loaders** for chat lists
- **Skeleton screens** for better UX

### Notifications
- **Toast notifications** for important events
- **Error messages** with detailed information
- **Success confirmations** for completed actions

## 🔒 Security Features

### Data Protection
- **Message Encryption** using safe encoding
- **Secure Authentication** with tokens
- **Input Validation** on all forms
- **XSS Protection** through content sanitization

### Session Management
- **Automatic session renewal**
- **Secure cookie storage**
- **Logout from all devices** support

## 🐛 Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check your internet connection
   - Verify server URL is correct
   - Ensure server is running

2. **Login Issues**
   - Verify email and password
   - Check if email is verified
   - Try password reset if needed

3. **Messages Not Sending**
   - Check WebSocket connection
   - Verify recipient is online
   - Check message encoding

4. **UI Not Loading**
   - Restart Acode
   - Reinstall plugin
   - Clear plugin cache

### Debug Mode
Enable debug mode by setting `DEVELOPMENT_MODE = true` in the plugin code to see detailed logs.

## 📝 Development

### Building from Source
1. Clone the repository
2. Modify the plugin code
3. Test in Acode development environment
4. Package for distribution

### File Structure
```
messenger-ax/
├── main.js # Main plugin file
├── icon.png # Plugin icon
├── README.md # This file
└── styles/ # Additional styles (if any)

```


### Dependencies
- Acode Editor API
- Cordova HTTP Plugin
- Cordova WebSocket Plugin

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests, report bugs, or suggest new features.

### Contribution Guidelines
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

If you need help with the plugin:

1. **Check this README** for solutions
2. **[Open an issue](https://github.com/hackesofice/Acode-messanger/issues)** on GitHub
3. **Contact support** via email


## 🙏 Acknowledgments

- **Acode Team** for the excellent editor platform
- **Contributors** who helped improve this plugin
- **Testers** for valuable feedback
- **Users** for making this plugin better

---

**Enjoy seamless messaging while coding with Messenger Ax!** 🚀💬

