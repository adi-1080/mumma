import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createRecipe, deleteRecipe } from "../actions/recipe-actions";

export default async function RecipesPage() {
    // Fetch current user session
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // Fetch all recipes, including the associated user's name (if it exists)
    const recipes = await prisma.recipe.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { name: true },
            },
        },
    });

    return (
        <div className="max-w-4xl mx-auto p-8 font-sans">
            <h1 className="text-3xl font-bold mb-8">Community Recipes</h1>

            {/* CREATE RECIPE FORM */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-12">
                <h2 className="text-xl font-semibold mb-4">
                    {session ? "Add to Your Recipe Book" : "Share an Anonymous Recipe"}
                </h2>

                {/* The 'action' attribute natively calls our Server Action */}
                <form action={createRecipe} className="flex flex-col gap-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="e.g., Midnight Spicy Maggi"
                        className="p-3 border rounded-md"
                        required
                    />
                    <textarea
                        name="ingredients"
                        placeholder="e.g., 1 pack Maggi, 2 cups water, magic masala, extra cheese..."
                        className="p-3 border rounded-md h-24"
                        required
                    />
                    <textarea
                        name="instructions"
                        placeholder="1. Boil water. 2. Add noodles and masala. 3. Stir for 2 mins..."
                        className="p-3 border rounded-md h-32"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Publish Recipe
                    </button>
                </form>
            </div>

            {/* RECIPE FEED */}
            <div className="space-y-6">
                {recipes.map((recipe) => (
                    <div key={recipe.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-2xl font-bold">{recipe.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    By {recipe.user?.name || "Anonymous Guest"} • {recipe.createdAt.toLocaleDateString()}
                                </p>
                            </div>

                            {/* Only show delete button if the logged-in user owns this recipe */}
                            {session?.user?.id === recipe.userId && (
                                <form action={async () => {
                                    "use server";
                                    await deleteRecipe(recipe.id);
                                }}>
                                    <button type="submit" className="text-red-500 hover:text-red-700 text-sm font-medium">
                                        Delete
                                    </button>
                                </form>
                            )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-1 bg-gray-50 p-4 rounded-md">
                                <h4 className="font-semibold mb-2">Ingredients</h4>
                                <p className="whitespace-pre-wrap text-gray-700 text-sm">{recipe.ingredients}</p>
                            </div>
                            <div className="md:col-span-2 bg-gray-50 p-4 rounded-md">
                                <h4 className="font-semibold mb-2">Instructions</h4>
                                <p className="whitespace-pre-wrap text-gray-700 text-sm">{recipe.instructions}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {recipes.length === 0 && (
                    <p className="text-center text-gray-500">No recipes yet. Be the first to share one!</p>
                )}
            </div>
        </div>
    );
}