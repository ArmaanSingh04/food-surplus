import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/db";
import { DefaultSession, DefaultUser } from "next-auth";
import { NextAuthOptions } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

export const NEXT_AUTH:NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials:{
                email: {label: "email" , type: "text" , placeholder: "Enter email"},
                password: {label: "password" , type: "password" , placeholder: "Enter password"}
            },
            async authorize(credentials , req){
                if(!credentials) return null

                const user = await prisma.user.findFirst({
                    where:{
                        email: credentials.email
                    }
                })

                // check the password
                if(user){
                    if(credentials.password == user.password){
                        return {
                            id: String(user.id),
                            email: user.email,
                            role: user.role
                        }
                    }
                    else{
                        return null
                    }
                }

                return null
            }
        })
    ],
    secret: "helloworld",
    callbacks: {
        // get those credentials in the jwt token
        async jwt({ token , user }){
            if(user){
                token.id = user.id;
                token.role = user.role
            }
            return token;
        },

        // put them into the session object
        async session({session , token}){
            if(token.sub && session.user){
                session.user.id = token.id as string
                session.user.role = token.role as string
            }
            return session
        }
    },
    pages:{
        signIn: "/login",
    }
}