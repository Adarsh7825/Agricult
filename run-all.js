const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Function to determine the correct Python command
function getPythonCommand() {
    return os.platform() === 'win32' ? 'python' : 'python3';
}

// Start Flask server
console.log('Starting Flask server...');
const pythonCmd = getPythonCommand();
const flaskProcess = spawn(pythonCmd, ['flsk_script/run_server.py'], {
    cwd: __dirname,
    stdio: 'inherit',
});

flaskProcess.on('error', (error) => {
    console.error('Failed to start Flask server:', error);
});

// Wait a bit for Flask to start
setTimeout(() => {
    // Start React Native app
    console.log('Starting React Native app...');
    const expoProcess = spawn('npx', ['expo', 'start'], {
        cwd: __dirname,
        stdio: 'inherit',
    });

    expoProcess.on('error', (error) => {
        console.error('Failed to start Expo:', error);
    });

    // Handle process termination
    process.on('SIGINT', () => {
        console.log('Shutting down...');
        flaskProcess.kill();
        expoProcess.kill();
        process.exit();
    });
}, 2000);

console.log('Services starting. Press Ctrl+C to stop all processes.'); 