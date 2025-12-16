DCInventory Application Setup

1. Backend Setup and Launch (Docker)

This assumes you have Docker and Docker Compose installed.

1.  Navigate to Project Root:
    
    cd DCInventory
   
2.  Build and Start Services:
    
    docker compose up --build 

2. Configuration Adjustment (If Required)

If the frontend is running on a physical Android device or outside the Docker network, ensure the API address in the frontend config file (e.g., `src/config.js`) is set to your machine's **local IP address** (not `localhost`) and the port exposed by Docker.

3. Frontend Setup and Launch (Android)

This assumes you have the Android SDK, necessary emulators/devices, and Node dependencies installed (`npm install`).

1.  Navigate to Frontend:
    
    cd mobile
    
2.  Run on Android:
    
    npx react-native run-android  
    
    (This will start the build process and launch the app on an connected device or emulator.)