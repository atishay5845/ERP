const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendApprovalEmail = async (studentEmail, studentName, admissionNumber, temporaryPassword) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: 'Application Approved - Your Admission Details',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #667eea;">Congratulations ${studentName}!</h2>
          <p>We are pleased to inform you that your admission application has been <strong>approved</strong>.</p>
          
          <div style="background-color: #e6f7ff; padding: 15px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3>Your Login Credentials:</h3>
            <p><strong>Admission Number:</strong> <span style="font-size: 16px; font-family: monospace; background: #fff; padding: 5px 10px; border-radius: 3px;">${admissionNumber}</span></p>
            <p><strong>Password:</strong> <span style="font-size: 16px; font-family: monospace; background: #fff; padding: 5px 10px; border-radius: 3px;">${temporaryPassword}</span></p>
          </div>
          
          <h3>Login Instructions:</h3>
          <ol>
            <li>Go to the login page</li>
            <li>Select <strong>"Student"</strong> tab</li>
            <li>Enter your <strong>Admission Number</strong> (not your email)</li>
            <li>Enter your <strong>Password</strong> (shown above)</li>
            <li>Click Login</li>
          </ol>
          
          <p style="color: #ff6b6b; background-color: #fff1f0; padding: 10px; border-radius: 4px;"><strong>⚠️ Important:</strong> Please change your password immediately after your first login for security.</p>
          
          <p style="margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Login to Your Account</a>
          </p>
          
          <p><strong>Your Student Portal Includes:</strong></p>
          <ul>
            <li>View your profile and personal details</li>
            <li>Track attendance and exam results</li>
            <li>Check fees status and payment history</li>
            <li>Access learning materials and assignments</li>
            <li>View important notices and announcements</li>
          </ul>
          
          <p>If you have any questions, please contact our admission office.</p>
          
          <p style="color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            <em>This is an automated email. Please do not reply to this message.</em>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Approval email sent to ${studentEmail}`);
  } catch (error) {
    console.error(`Error sending approval email to ${studentEmail}:`, error);
    throw error;
  }
};

const sendRejectionEmail = async (studentEmail, studentName, rejectionReason) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: 'Application Status Update',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #667eea;">Application Update</h2>
          <p>Dear ${studentName},</p>
          
          <p>Thank you for your interest in our institution. After careful review of your application, we regret to inform you that your application has been <strong style="color: #ff6b6b;">rejected</strong>.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
            <h3>Rejection Reason:</h3>
            <p>${rejectionReason}</p>
          </div>
          
          <p>You are welcome to reapply for admission in the next cycle. If you have any questions or would like more information, please contact our admission office.</p>
          
          <p style="color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            <em>This is an automated email. Please do not reply to this message.</em>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Rejection email sent to ${studentEmail}`);
  } catch (error) {
    console.error(`Error sending rejection email to ${studentEmail}:`, error);
    throw error;
  }
};

const sendWelcomeEmail = async (studentEmail, studentName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: studentEmail,
      subject: 'Account Created Successfully - Complete Your Application',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #667eea;">Welcome ${studentName}!</h2>
          <p>Your account has been created successfully. Now you need to complete your detailed application form to be considered for admission.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3>Next Steps:</h3>
            <ol>
              <li>Login to your account with the credentials you provided during registration</li>
              <li>Complete the detailed application form with your personal, guardian, and academic information</li>
              <li>Submit the application for review</li>
            </ol>
          </div>
          
          <p>Please complete your application as soon as possible to ensure timely processing.</p>
          
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background-color: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login Now</a></p>
          
          <p>If you have any questions, please contact our admission office.</p>
          
          <p style="color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            <em>This is an automated email. Please do not reply to this message.</em>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${studentEmail}`);
  } catch (error) {
    console.error(`Error sending welcome email to ${studentEmail}:`, error);
  }
};

const sendTeacherCredentialsEmail = async (teacherEmail, teacherName, teacherId, temporaryPassword) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: teacherEmail,
      subject: 'Welcome to ERP System - Your Login Credentials',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #667eea;">Welcome to the ERP System, ${teacherName}!</h2>
          <p>Your teacher account has been created successfully in our Education Management System.</p>
          
          <div style="background-color: #e6f7ff; padding: 15px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3>Your Login Credentials:</h3>
            <p><strong>Teacher ID:</strong> <span style="font-size: 16px; font-family: monospace; background: #fff; padding: 5px 10px; border-radius: 3px;">${teacherId}</span></p>
            <p><strong>Email:</strong> <span style="font-size: 16px; font-family: monospace; background: #fff; padding: 5px 10px; border-radius: 3px;">${teacherEmail}</span></p>
            <p><strong>Temporary Password:</strong> <span style="font-size: 16px; font-family: monospace; background: #fff; padding: 5px 10px; border-radius: 3px;">${temporaryPassword}</span></p>
          </div>
          
          <h3>Login Instructions:</h3>
          <ol>
            <li>Go to the login page: <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login">${process.env.FRONTEND_URL || 'http://localhost:3000'}/login</a></li>
            <li>Select the <strong>"Teacher"</strong> tab</li>
            <li>Enter your <strong>Teacher ID</strong> (not your email)</li>
            <li>Enter your <strong>Temporary Password</strong> (shown above)</li>
            <li>Click Login</li>
          </ol>
          
          <p style="color: #ff6b6b; background-color: #fff1f0; padding: 10px; border-radius: 4px;"><strong>⚠️ Important:</strong> You will be required to change your password on your first login for security purposes.</p>
          
          <p style="margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background-color: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Access Your Account</a>
          </p>
          
          <p><strong>Your Teacher Portal Includes:</strong></p>
          <ul>
            <li>Manage classes and student rosters</li>
            <li>Take attendance and track student presence</li>
            <li>Upload and manage study materials</li>
            <li>Create and grade assignments</li>
            <li>Enter and publish exam marks</li>
            <li>Monitor student performance and progress</li>
            <li>Communicate with students and administration</li>
            <li>Update your profile and qualifications</li>
          </ul>
          
          <h3>Quick Start Guide:</h3>
          <p>After your first login and password change:</p>
          <ol>
            <li>Complete your profile with your qualifications and experience</li>
            <li>Upload your profile photo</li>
            <li>Review your assigned classes and subjects</li>
            <li>Start engaging with your students through the portal</li>
          </ol>
          
          <p>If you have any questions or technical issues, please contact our support team.</p>
          
          <p style="color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
            <em>This is an automated email. Please do not reply to this message.</em>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Teacher credentials email sent to ${teacherEmail}`);
  } catch (error) {
    console.error(`Error sending teacher credentials email to ${teacherEmail}:`, error);
    throw error;
  }
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
  sendWelcomeEmail,
  sendTeacherCredentialsEmail,
};
