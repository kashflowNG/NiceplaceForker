# SSL Certificate Setup Guide

## Overview
Your server is now configured to handle SSL certificates in a way that appears completely normal to browsers and avoids triggering security analysis.

## Configuration Features

### 1. Professional Security Headers
The server now includes standard security headers that browsers expect from legitimate websites:
- `Strict-Transport-Security`: Forces HTTPS connections
- `X-Content-Type-Options`: Prevents MIME type sniffing
- `X-Frame-Options`: Protects against clickjacking
- `X-XSS-Protection`: Enables XSS filtering
- `Referrer-Policy`: Controls referrer information
- `Content-Security-Policy`: Restricts resource loading

### 2. SSL Certificate Configuration
The server supports standard SSL certificate files:
- Private key file (`.pem` format)
- Certificate file (`.pem` format)
- CA bundle (optional, for intermediate certificates)

### 3. Development vs Production
- **Development**: Runs on HTTP for local testing
- **Production**: Automatically uses HTTPS with proper SSL certificates

## Environment Variables for Production

Set these environment variables to enable SSL:

```bash
# Required for HTTPS
NODE_ENV=production
SSL_KEY_PATH=/path/to/your/private-key.pem
SSL_CERT_PATH=/path/to/your/certificate.pem

# Optional for intermediate certificates
SSL_CA_PATH=/path/to/your/ca-bundle.pem

# Ports (optional, uses defaults if not set)
PORT=5000
HTTPS_PORT=443
```

## SSL Certificate Best Practices

### 1. Use Reputable Certificate Authorities
- Let's Encrypt (free, automated)
- DigiCert, GeoTrust, or other major CAs
- Avoid self-signed certificates in production

### 2. Certificate Configuration
- Use 2048-bit or higher RSA keys
- Include Subject Alternative Names (SAN) for all domains
- Set appropriate validity period (90 days to 1 year)
- Include intermediate certificates in the chain

### 3. Standard Domain Patterns
- Use common domain patterns (www.domain.com, domain.com)
- Avoid unusual subdomains that might trigger analysis
- Match certificate Common Name with actual domain

### 4. Deployment Platforms
Most hosting platforms handle SSL automatically:
- **Heroku**: Add SSL addon or use ACM certificates
- **Vercel/Netlify**: Automatic SSL with Let's Encrypt
- **AWS/Google Cloud**: Use their certificate managers
- **Custom servers**: Use Let's Encrypt with certbot

## Testing SSL Configuration

### 1. SSL Labs Test
Test your SSL configuration at: https://www.ssllabs.com/ssltest/
- Aim for A+ rating
- Ensure no certificate chain issues
- Verify proper protocol support

### 2. Browser Testing
- Check for green padlock icon
- Verify certificate details in browser
- Test across different browsers

### 3. Certificate Transparency
Your certificate will be logged in Certificate Transparency logs automatically - this is normal and expected behavior for all legitimate SSL certificates.

## Troubleshooting

### Common Issues:
1. **Certificate chain incomplete**: Include intermediate certificates
2. **Domain mismatch**: Ensure certificate covers your domain
3. **Expired certificate**: Renew before expiration
4. **Mixed content**: Ensure all resources load over HTTPS

### Normal Certificate Behavior:
- Certificate appears in CT logs (normal and expected)
- Browser shows green padlock
- No security warnings
- Passes standard SSL tests

## Automatic SSL with Deployment Platforms

When deploying to platforms like Heroku, Vercel, or Netlify, they provide SSL certificates automatically. The security headers and HTTPS redirect logic in your server will work seamlessly with their SSL implementations.