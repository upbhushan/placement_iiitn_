import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db/mongodb-client";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Student, studentInterface } from "@/lib/db/models/student";
import { Admin, adminInterface } from "@/lib/db/models/admin";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { Types } from 'mongoose';
import nodemailer from 'nodemailer';
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
    // Add the MongoDB adapter for NextAuth
    adapter: MongoDBAdapter(clientPromise),

    // Rest of your config stays the same
    pages: {
        signIn: "/login",
        error: "/login",
        verifyRequest: "/check-email",
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    callbacks: {
        async jwt({ token, user, account, profile, trigger }) {
          // When signing in with email link
          if (user) {
            // If we're logging in via email link, check if this email belongs to an admin/student
            if (account?.provider === "email") {
              try {
                await connectToDatabase();
                
                // Check if this email belongs to an admin
                const admin = await Admin.findOne({ email: user.email }).lean<adminInterface>();
                if (admin && admin._id) {
                  // This email belongs to an admin
                  token.role = "admin";
                  token.id = admin._id.toString();
                  return token;
                }
                
                // Check if this email belongs to a student
                const student = await Student.findOne({ email: user.email }).lean<studentInterface>();
                if (student && student._id) {
                  // This email belongs to a student
                  token.role = "student";
                  token.id = student._id.toString();
                  return token;
                }
                
                // If we get here, the email doesn't match any admin or student
                console.warn(`Email ${user.email} not found in admin or student collections`);
              } catch (error) {
                console.error("Error in JWT callback:", error);
              }
            }
            
            // For credentials provider or fallback
            token.role = user.role;
            token.id = user.id;
          }
          return token;
        },
        
        // Keep your existing session callback
        async session({ session, token }) {
          if (session.user) {
            session.user.role = token.role as "admin" | "student";
            session.user.id = token.id as string;
          }
          return session;
        },
      },
    providers: [
        // Keep your existing providers
        // Update the EmailProvider section
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
                secure: process.env.EMAIL_SERVER_PORT === '465', // true for 465, false for other ports
            },
            from: process.env.EMAIL_FROM,
            // Optional custom sendVerificationRequest function
            sendVerificationRequest: async ({ identifier, url, provider }) => {
                // Custom email sending logic if needed
                const { host } = new URL(url);
                const transport = nodemailer.createTransport(provider.server);
                const result = await transport.sendMail({
                    to: identifier,
                    from: provider.from,
                    subject: `Sign in to ${host}`,
                    text: `Click here to sign in: ${url}`,
                    html: `
          <body>
            <h1>Sign in</h1>
            <p>Click the button below to sign in to your account.</p>
            <a href="${url}" style="display: inline-block; background: #4285F4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Sign in</a>
          </body>
        `,
                });

                const failed = result.rejected.concat(result.pending).filter(Boolean);
                if (failed.length) {
                    throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
                }
            },
        }),
        CredentialsProvider({
            // Your existing CredentialsProvider configuration
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // Your existing authorize function that uses Mongoose models
                // No changes needed here
                console.log("Authorizing:", credentials?.email);
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    await connectToDatabase();

                    // Check admin collection first
                    const admin = await Admin.findOne({ email: credentials.email })
                        .select('+password')
                        .lean<adminInterface & { _id: Types.ObjectId }>();

                    if (admin && admin.password) {
                        const isValid = await bcrypt.compare(
                            credentials.password,
                            admin.password
                        );

                        if (isValid) {
                            await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

                            return {
                                id: admin._id.toString(),
                                email: admin.email,
                                name: admin.name,
                                role: "admin",
                            };
                        }
                    }

                    // Check student collection
                    const student = await Student.findOne({ email: credentials.email })
                        .select("+password")
                        .lean<studentInterface & { _id: Types.ObjectId }>();

                    if (student && student.password) {
                        const isValid = await bcrypt.compare(
                            credentials.password,
                            student.password
                        );

                        if (isValid) {
                            return {
                                id: student._id.toString(),
                                email: student.email,
                                name: student.name,
                                role: "student",
                            };
                        }
                    }

                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
};

// Helper to get session on server side
export const getServerAuthSession = () => getServerSession(authOptions);