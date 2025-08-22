"use server";

import prisma from "@/db";
import { cloudinary } from "@/lib/cloudinary";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


export type FoodType = "veg" | "nonveg";
export type QuantityType = "plates" | "kg" | "items";
export type FreshnessStatus = "freshcooked" | "packaged" | "near_expiry" | "unknown";

export interface CreatePostData {
  food_name: string;
  food_type: FoodType;
  quantity_value: number;
  quantity_type: QuantityType;
  expiry_timer: Date;
  image: File;
  freshness_status: FreshnessStatus;
}

export async function createPost(formData: FormData) {
  try {
    // Extract form data
    const food_name = formData.get("food_name") as string;
    const food_type = formData.get("food_type") as FoodType;
    const quantity_value = parseInt(formData.get("quantity_value") as string);
    const quantity_type = formData.get("quantity_type") as QuantityType;
    const expiry_timer = new Date(formData.get("expiry_timer") as string);
    const freshness_status = formData.get("freshness_status") as FreshnessStatus;
    const imageCount = parseInt(formData.get("imageCount") as string) || 0;

    if (!food_name || !food_type || !quantity_value || !quantity_type || !expiry_timer || !freshness_status) {
      throw new Error("All fields are required");
    }

    if (imageCount === 0) {
      throw new Error("At least one image is required");
    }

    // // Validate quantity value
    // if (quantity_value <= 0) {
    //   throw new Error("Quantity must be greater than 0");
    // }

    // // Validate expiry timer (must be in the future)
    // if (expiry_timer <= new Date()) {
    //   throw new Error("Expiry time must be in the future");
    // }


    const imageUrls: string[] = [];
    
    for (let i = 0; i < imageCount; i++) {
      const image = formData.get(`image_${i}`) as File;
      
      if (image) {

        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const base64Image = buffer.toString('base64');
        const dataURI = `data:${image.type};base64,${base64Image}`;

        try {
          const uploadResult = await cloudinary.uploader.upload(dataURI, {
            folder: "foodshare",
            resource_type: "image",
          });
          
          imageUrls.push(uploadResult.secure_url);
        } catch (uploadError) {
          console.error(`Error uploading image ${i + 1}:`, uploadError);
          throw new Error(`Failed to upload image ${i + 1}`);
        }
      }
    }

    if (imageUrls.length === 0) {
      throw new Error("No images were successfully uploaded");
    }

    const post = await prisma.post.create({
      data: {
        food_name,
        food_type,
        quantity_value,
        quantity_type,
        expiry_timer,
        image: imageUrls,
        freshness_status,
      },
    });

    revalidatePath("/donor/form");
    
    return { success: true, post };
  } catch (error) {
    console.error("Error creating post:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create post" 
    };
  }
}

// create a action to take email password and account type and put it into the user table
export async function registerUser(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const accountType = (String(formData.get("accountType") || "recipient") === "donor")
    ? "donor"
    : "recipient";

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  await prisma.user.create({
    data: {
      email,
      password,
      role: accountType === "recipient" ? "USER" : "DONOR",
    },
  });

  revalidatePath("/login");
  redirect("/login");
}

// Function to fetch all posts
export async function getAllPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        post_id: 'desc'
      }
    });
    
    return { success: true, posts };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch posts" 
    };
  }
}