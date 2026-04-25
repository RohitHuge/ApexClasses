import { BrevoClient } from '@getbrevo/brevo';
import dotenv from 'dotenv';
dotenv.config();

const FROM = { name: 'Apex Classes', email: process.env.EMAIL_FROM || 'noreply@apexclasses.org' };

const send = async ({ to, subject, html }) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn('⚠️  BREVO_API_KEY not set — skipping email to', to);
        return;
    }
    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });
    try {
        await client.transactionalEmails.sendTransacEmail({
            sender: FROM,
            to: [{ email: to }],
            subject,
            htmlContent: html,
        });
        console.log(`📧 Email sent to ${to}: ${subject}`);
    } catch (err) {
        console.error('Email send error:', err?.message || err);
    }
};

// ── Templates ──────────────────────────────────────────────────────────────

export const sendWelcomeEmail = (user) => send({
    to: user.email,
    subject: 'Welcome to Apex Classes!',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#4f46e5">Welcome, ${user.name}!</h2>
        <p>Your account has been created successfully. You can now log in and explore all our services.</p>
        <a href="${process.env.FRONTEND_URL || 'https://apexclasses.org'}/dashboard" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Go to Dashboard</a>
        <p style="margin-top:24px;color:#6b7280;font-size:14px">Apex Classes — Engineering Your Future</p>
    </div>`
});

export const sendPasswordResetEmail = (user, resetUrl) => send({
    to: user.email,
    subject: 'Reset Your Apex Classes Password',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#4f46e5">Password Reset</h2>
        <p>Hi ${user.name},</p>
        <p>Click the button below to set your password. This link expires in <strong>1 hour</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Set Password</a>
        <p style="margin-top:16px;color:#6b7280;font-size:13px">If you didn't request this, ignore this email.</p>
    </div>`
});

export const sendOrderConfirmationEmail = (user, order) => {
    const messages = {
        book_online: { title: 'Your Digital Book is Ready!', body: 'Log in to your Dashboard to start reading the Engineering Admission Guide 2026.', link: '/dashboard' },
        book_offline: { title: 'Order Received — Hardcopy on its way!', body: 'Your book will be dispatched to your address within 2–3 business days.', link: '/orders' },
        counselling_offline: { title: 'Counselling Session Confirmed!', body: 'We will contact you shortly to confirm the slot details.', link: '/orders' },
        counselling_online: { title: 'Online Counselling Confirmed!', body: 'A Zoom link will be shared before your scheduled slot.', link: '/orders' },
        counselling_complete: { title: 'Complete Guidance Package Activated!', body: 'Our team will reach out within 24 hours to begin your personalized plan.', link: '/orders' },
        jlpt_online: { title: 'JLPT N5 Enrollment Confirmed!', body: 'Your first class details and batch schedule will be shared within 24 hours.', link: '/orders' },
        jlpt_offline: { title: 'JLPT N5 Offline Batch Confirmed!', body: 'Classroom schedule and location details will follow shortly.', link: '/orders' },
    };

    const key = `${order.product_type}_${order.mode}`;
    const msg = messages[key] || { title: 'Order Confirmed!', body: 'Thank you for your purchase.', link: '/orders' };
    const base = process.env.FRONTEND_URL || 'https://apexclasses.org';

    return send({
        to: user.email,
        subject: `Apex Classes — ${msg.title}`,
        html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
            <h2 style="color:#4f46e5">${msg.title}</h2>
            <p>Hi ${user.name},</p>
            <p>${msg.body}</p>
            <table style="margin:16px 0;border-collapse:collapse;width:100%">
                <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Order ID</td><td style="padding:8px;background:#f9fafb">${order.id.slice(0, 8).toUpperCase()}</td></tr>
                <tr><td style="padding:8px;font-weight:bold">Amount Paid</td><td style="padding:8px">₹${order.amount}</td></tr>
                <tr><td style="padding:8px;background:#f9fafb;font-weight:bold">Date</td><td style="padding:8px;background:#f9fafb">${new Date().toLocaleDateString('en-IN')}</td></tr>
            </table>
            <a href="${base}${msg.link}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">View Order</a>
            <p style="margin-top:24px;color:#6b7280;font-size:13px">Apex Classes — Engineering Your Future</p>
        </div>`
    });
};

export const sendBookShippedEmail = (user, order, trackingInfo = '') => send({
    to: user.email,
    subject: 'Your Book Has Been Shipped!',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#4f46e5">Your Book is on the Way!</h2>
        <p>Hi ${user.name}, your Engineering Admission Guide 2026 has been dispatched.</p>
        ${trackingInfo ? `<p><strong>Tracking Info:</strong> ${trackingInfo}</p>` : ''}
        <p>Expected delivery: 2–4 business days.</p>
        <a href="${process.env.FRONTEND_URL || 'https://apexclasses.org'}/orders" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Track Order</a>
    </div>`
});

export const sendBookDeliveredEmail = (user) => send({
    to: user.email,
    subject: 'Your Book Has Been Delivered!',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#16a34a">Delivered!</h2>
        <p>Hi ${user.name}, your Engineering Admission Guide 2026 has been delivered successfully.</p>
        <p>We hope it helps you on your journey. Good luck!</p>
    </div>`
});

export const sendMigratedUserResetEmail = (user, resetUrl) => send({
    to: user.email,
    subject: 'Action Required — Set Your Apex Classes Password',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#4f46e5">We've Upgraded Our System</h2>
        <p>Hi ${user.name},</p>
        <p>We've upgraded our authentication system. Please set a new password to continue accessing your account.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold">Set My Password</a>
        <p style="margin-top:16px;color:#6b7280;font-size:13px">This link expires in 30 days. Your order history is safe and untouched.</p>
    </div>`
});
