const https = require('https');

exports.sendAdminNotification = async (user) => {
  const data = JSON.stringify({
    from: {
      address: process.env.ZEPTOMAIL_FROM_EMAIL,
      name: "PrimeWave Bank System"
    },
    to: [
      {
        email_address: {
          address: "abrahamisaacjames22@gmail.com",
          name: "Admin"
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
    }
  };

  const req = https.request(options);
  
  req.on('error', (error) => {
    console.error('ZeptoMail Error:', error);
  });

  req.write(data);
  req.end();
};