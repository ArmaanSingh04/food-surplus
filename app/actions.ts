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
export async function getAllPosts(userId?: string) {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        post_id: 'desc'
      }
    });

    // Calculate leftover quantity for each post by subtracting claimed quantities
    const postsWithLeftoverQuantity = await Promise.all(
      posts.map(async (post) => {
        // Get all claims for this post
        const claims = await prisma.claim.findMany({
          where: { post_id: post.post_id },
          select: { claimed_quantity: true }
        });

        // Calculate total claimed quantity
        const totalClaimed = claims.reduce((sum, claim) => sum + claim.claimed_quantity, 0);
        
        // Calculate leftover quantity
        const leftoverQuantity = post.quantity_value - totalClaimed;
        
        return {
          ...post,
          leftoverQuantity,
          isAvailable: leftoverQuantity > 0
        };
      })
    );

    // If userId is provided, check which posts the user has claimed
    let postsWithClaimStatus = postsWithLeftoverQuantity;
    if (userId) {
      const userIdNum = parseInt(userId);
      if (!isNaN(userIdNum)) {
        const userClaims = await prisma.claim.findMany({
          where: { user_id: userIdNum },
          select: { post_id: true, status: true }
        });

        const claimsMap = new Map(
          userClaims.map(claim => [claim.post_id, claim.status])
        );

        postsWithClaimStatus = postsWithLeftoverQuantity.map(post => ({
          ...post,
          userClaimStatus: claimsMap.get(post.post_id) || null
        }));
      }
    }
    
    return { success: true, posts: postsWithClaimStatus };
  } catch (error) {
    console.error("Error fetching posts:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch posts" 
    };
  }
}

// Function to claim food
export async function claimFood(postId: number, userId: string, claimedQuantity: number) {
  try {
    // Convert userId from string to number
    const userIdNum = parseInt(userId);
    
    if (isNaN(userIdNum)) {
      return { 
        success: false, 
        error: "Invalid user ID" 
      };
    }

    // First check if the post exists and has enough quantity
    const post = await prisma.post.findUnique({
      where: { post_id: postId }
    });

    if (!post) {
      return { 
        success: false, 
        error: "Post not found" 
      };
    }

    // Check if user has already claimed this post
    const existingClaim = await prisma.claim.findFirst({
      where: {
        post_id: postId,
        user_id: userIdNum
      }
    });

    if (existingClaim) {
      return { 
        success: false, 
        error: "You have already claimed this food" 
      };
    }

    // Calculate leftover quantity for this post
    const existingClaims = await prisma.claim.findMany({
      where: { post_id: postId },
      select: { claimed_quantity: true }
    });

    const totalClaimed = existingClaims.reduce((sum, claim) => sum + claim.claimed_quantity, 0);
    const leftoverQuantity = post.quantity_value - totalClaimed;

    // Check if the requested quantity is available
    if (claimedQuantity > leftoverQuantity) {
      return { 
        success: false, 
        error: `Only ${leftoverQuantity} ${post.quantity_type} available, but you requested ${claimedQuantity}` 
      };
    }

    // Determine claim status based on leftover quantity availability
    const claimStatus = claimedQuantity <= leftoverQuantity ? 'accepted' : 'pending';

    // Create the claim
    const claim = await prisma.claim.create({
      data: {
        post_id: postId,
        user_id: userIdNum,
        claimed_quantity: claimedQuantity,
        status: claimStatus,
      }
    });

    // TODO: In the future, you might want to update the post quantity
    // or mark it as claimed based on business logic
    
    return { 
      success: true, 
      claim,
      status: claimStatus,
      message: claimStatus === 'accepted' 
        ? `Successfully claimed ${claimedQuantity} ${post.quantity_type} of ${post.food_name}!`
        : `Claim submitted for ${claimedQuantity} ${post.quantity_type} of ${post.food_name}. Status: Pending`
    };
  } catch (error) {
    console.error("Error claiming food:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to claim food" 
    };
  }
}

// Function to get user claims
export async function getUserClaims(userId: string) {
  try {
    const userIdNum = parseInt(userId);
    
    if (isNaN(userIdNum)) {
      return { 
        success: false, 
        error: "Invalid user ID" 
      };
    }

    const claims = await prisma.claim.findMany({
      where: {
        user_id: userIdNum
      },
      include: {
        post: {
          select: {
            post_id: true,
            food_name: true,
            food_type: true,
            quantity_value: true,
            quantity_type: true,
            expiry_timer: true,
            image: true,
            freshness_status: true
          }
        }
      },
      orderBy: {
        claimed_at: 'desc'
      }
    });
    
    return { success: true, claims };
  } catch (error) {
    console.error("Error fetching user claims:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch user claims" 
    };
  }
}