// Beecroft Valley - Cooking System
// Handles recipes, cooking interactions, and food preparation

class CookingSystem {
    constructor(game) {
        this.game = game;
        this.recipes = {};
        this.unlockedRecipes = [];
        this.cookingUI = {
            showing: false,
            selectedRecipe: null,
            category: 'basic'
        };
    }

    async loadRecipes() {
        try {
            const response = await fetch('data/recipes.json');
            const data = await response.json();

            // Flatten all recipe categories
            this.recipes = {};
            for (const category in data) {
                data[category].forEach(recipe => {
                    this.recipes[recipe.id] = recipe;
                    if (recipe.unlocked) {
                        this.unlockedRecipes.push(recipe.id);
                    }
                });
            }

            console.log(`Loaded ${Object.keys(this.recipes).length} recipes`);
        } catch (error) {
            console.error('Failed to load recipes:', error);
            this.createDefaultRecipes();
        }
    }

    createDefaultRecipes() {
        // Fallback recipes if JSON fails to load
        this.recipes = {
            friedEgg: {
                id: 'friedEgg',
                name: 'Fried Egg',
                icon: '🍳',
                ingredients: { egg: 1 },
                result: { energy: 40, sellPrice: 60 },
                unlocked: true
            },
            omelet: {
                id: 'omelet',
                name: 'Omelet',
                icon: '🍳',
                ingredients: { egg: 2, milk: 1 },
                result: { energy: 70, sellPrice: 120 },
                unlocked: true
            },
            salad: {
                id: 'salad',
                name: 'Salad',
                icon: '🥗',
                ingredients: { tomato: 2, carrot: 1, lettuce: 1 },
                result: { energy: 50, sellPrice: 90 },
                unlocked: true
            }
        };

        this.unlockedRecipes = ['friedEgg', 'omelet', 'salad'];
    }

    openCookingMenu() {
        this.cookingUI.showing = true;
        this.cookingUI.selectedRecipe = null;
        this.game.uiState.showingMenu = true;
    }

    closeCookingMenu() {
        this.cookingUI.showing = false;
        this.game.uiState.showingMenu = false;
    }

    hasIngredients(recipeId) {
        const recipe = this.recipes[recipeId];
        if (!recipe) return false;

        for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
            const playerAmount = this.game.getInventoryCount(ingredient);
            if (playerAmount < amount) {
                return false;
            }
        }
        return true;
    }

    cookRecipe(recipeId) {
        const recipe = this.recipes[recipeId];
        if (!recipe) {
            console.error('Recipe not found:', recipeId);
            return false;
        }

        // Check if unlocked
        if (!this.unlockedRecipes.includes(recipeId)) {
            this.game.showMessage(`Recipe locked! ${recipe.unlockedBy || 'Unknown unlock condition'}`);
            return false;
        }

        // Check ingredients
        if (!this.hasIngredients(recipeId)) {
            this.game.showMessage(`Not enough ingredients!`);
            return false;
        }

        // Remove ingredients from inventory
        for (const [ingredient, amount] of Object.entries(recipe.ingredients)) {
            this.game.removeFromInventory(ingredient, amount);
        }

        // Add cooked item to inventory
        const cookedItem = {
            id: recipeId,
            name: recipe.name,
            icon: recipe.icon,
            energy: recipe.result.energy,
            sellPrice: recipe.result.sellPrice,
            type: 'cooked'
        };

        this.game.addToInventory(cookedItem);

        this.game.showMessage(`Cooked ${recipe.name}! +${recipe.result.energy} energy when eaten`);

        // Small energy cost for cooking
        this.game.player.energy = Math.max(0, this.game.player.energy - 5);

        return true;
    }

    unlockRecipe(recipeId) {
        if (!this.unlockedRecipes.includes(recipeId)) {
            this.unlockedRecipes.push(recipeId);
            const recipe = this.recipes[recipeId];
            if (recipe) {
                this.game.showMessage(`New recipe learned: ${recipe.name}!`);
            }
        }
    }

    renderCookingUI(ctx) {
        if (!this.cookingUI.showing) return;

        const width = 600;
        const height = 500;
        const x = (this.game.canvas.width - width) / 2;
        const y = (this.game.canvas.height - height) / 2;

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        // Menu background
        ctx.fillStyle = '#2c1810';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🍳 COOKING 🍳', x + width / 2, y + 40);

        // Instructions
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.fillText('Click a recipe to cook • ESC to close', x + width / 2, y + 70);

        // List unlocked recipes
        ctx.textAlign = 'left';
        ctx.font = '20px Arial';
        let yOffset = y + 110;
        let recipeCount = 0;

        for (const recipeId of this.unlockedRecipes) {
            const recipe = this.recipes[recipeId];
            if (!recipe) continue;

            const hasIngr = this.hasIngredients(recipeId);

            // Recipe box
            ctx.fillStyle = hasIngr ? '#1a5c1a' : '#5c1a1a';
            ctx.fillRect(x + 20, yOffset - 25, width - 40, 50);
            ctx.strokeStyle = hasIngr ? '#2d8f2d' : '#8f2d2d';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 20, yOffset - 25, width - 40, 50);

            // Recipe name and icon
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`${recipe.icon} ${recipe.name}`, x + 40, yOffset);

            // Ingredients
            ctx.font = '14px Arial';
            ctx.fillStyle = '#CCCCCC';
            let ingredText = 'Need: ';
            for (const [ing, amt] of Object.entries(recipe.ingredients)) {
                const playerAmt = this.game.getInventoryCount(ing);
                ingredText += `${ing}(${playerAmt}/${amt}) `;
            }
            ctx.fillText(ingredText, x + 40, yOffset + 18);

            // Result
            ctx.fillStyle = '#FFD700';
            ctx.fillText(`→ +${recipe.result.energy} energy, sell ${recipe.result.sellPrice}g`, x + 350, yOffset + 18);

            // Click area for this recipe
            const recipeBox = {
                x: x + 20,
                y: yOffset - 25,
                width: width - 40,
                height: 50,
                recipeId: recipeId
            };

            // Store for click detection
            if (!this.cookingUI.recipeBoxes) this.cookingUI.recipeBoxes = [];
            this.cookingUI.recipeBoxes[recipeCount] = recipeBox;

            yOffset += 60;
            recipeCount++;

            if (yOffset > y + height - 60) break; // Don't overflow
        }

        // Close button
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x + width - 120, y + height - 50, 100, 35);
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + width - 120, y + height - 50, 100, 35);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Close', x + width - 70, y + height - 25);

        this.cookingUI.closeButton = {
            x: x + width - 120,
            y: y + height - 50,
            width: 100,
            height: 35
        };
    }

    handleClick(mouseX, mouseY) {
        if (!this.cookingUI.showing) return false;

        // Check close button
        if (this.cookingUI.closeButton) {
            const btn = this.cookingUI.closeButton;
            if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
                mouseY >= btn.y && mouseY <= btn.y + btn.height) {
                this.closeCookingMenu();
                return true;
            }
        }

        // Check recipe boxes
        if (this.cookingUI.recipeBoxes) {
            for (const box of this.cookingUI.recipeBoxes) {
                if (!box) continue;
                if (mouseX >= box.x && mouseX <= box.x + box.width &&
                    mouseY >= box.y && mouseY <= box.y + box.height) {
                    this.cookRecipe(box.recipeId);
                    return true;
                }
            }
        }

        return false;
    }
}
