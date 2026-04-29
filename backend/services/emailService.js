const https = require('https');

exports.sendAdminNotification = async (user) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      from: {
        address: process.env.ZEPTOMAIL_FROM_EMAIL,
        name: "PrimeWave Bank System"
      },
      to: [
        {
          email_address: {
            address: "helpxprimewavebank@gmail.com",
            name: "PrimeWave Bank"
          }
        }
      ],
      subject: "New User Registration Alert",
      htmlbody: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #1a1a1a;">New Registration Notification</h2>
          <p>A new user has just registered on the platform:</p>
          <ul>
            <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
            <li><strong>Email:</strong> ${user.email}</li>
            <li><strong>Username:</strong> ${user.username}</li>
            <li><strong>Country:</strong> ${user.country || 'N/A'}</li>
            <li><strong>Registration Date:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          <p style="color: #666; font-size: 12px;">This is an automated security notification.</p>
        </div>
      `
    });

    const options = {
      hostname: 'api.zeptomail.com',
      path: '/v1.1/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': process.env.ZEPTOMAIL_API_KEY,
        'content-type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(responseBody);
        } else {
          reject(new Error(`ZeptoMail failed with status ${res.statusCode}: ${responseBody}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
};