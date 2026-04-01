"use server";

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createRecipe(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const title = formData.get("title") as string;
    const ingredients = formData.get("ingredients") as string;
    const instructions = formData.get("instructions") as string;

    if (!title || !ingredients || !instructions) {
        throw new Error("Missing required fields");
    }

    await prisma.recipe.create({
        data: {
            title,
            ingredients,
            instructions,
            userId: session?.user?.id || null,
        },
    });

    revalidatePath("/recipes");
};

export async function deleteRecipe(id: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Security check: Ensure the user owns the recipe before deleting
    const recipe = await prisma.recipe.findUnique({ where: { id } });

    if (recipe?.userId !== session?.user?.id) {
        throw new Error("Unauthorized: You can only delete your own recipes.");
    }

    await prisma.recipe.delete({
        where: { id },
    });

    revalidatePath("/recipes");
}