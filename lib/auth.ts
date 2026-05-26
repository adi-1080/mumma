import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { sendWelcomeEmail, sendVerificationEmail, sendResetPasswordEmail } from "./email";
import { emailOTP } from "better-auth/plugins/email-otp";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await sendWelcomeEmail(user.email, user.name || "beta");
                }
            }
        },
        verification: {
            create: {
                before: async (verification) => {
                    // Delete any existing verifications with the same identifier to prevent coexisting old OTPs
                    await prisma.verification.deleteMany({
                        where: { identifier: verification.identifier }
                    });
                }
            }
        }
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async ({ user, url, token }, request) => {
            await sendResetPasswordEmail(user.email, user.name || "beta", url, token);
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            await sendVerificationEmail(user.email, user.name || "beta", url, token);
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }, ctx) {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                if (type === "email-verification") {
                    const verificationUrl = `${appUrl}/verify-email?email=${encodeURIComponent(email)}&token=${otp}`;
                    await sendVerificationEmail(email, "beta", verificationUrl, otp);
                } else if (type === "forget-password") {
                    const resetUrl = `${appUrl}/reset-password?email=${encodeURIComponent(email)}&token=${otp}`;
                    await sendResetPasswordEmail(email, "beta", resetUrl, otp);
                }
            },
            overrideDefaultEmailVerification: true,
            sendVerificationOnSignUp: true,
        })
    ]
});