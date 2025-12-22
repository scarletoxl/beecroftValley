// Beecroft Valley - Crafting System
// Handles carpenter crafting with Bill

class CraftingSystem {
    constructor(game) {
        this.game = game;
        this.recipes = {};
        this.unlockedRecipes = [];
        this.craftingUI = {
            showing: false,
            selectedRecipe: null,
            category: 'furniture'
        };
    }

    async loadRecipes() {
        try {
            const response = await fetch('data/crafting.json');
            const data = await response.json();

            // Flatten all crafting categories
            this.recipes = {};
            for (const category in data) {
                data[category].forEach(recipe => {
                    this.recipes[recipe.id] = recipe;
                    this.recipes[recipe.id].category = category;
                    if (recipe.unlocked) {
                        this.unlockedRecipes.push(recipe.id);
                    }
                });
            }

            console.log(`Loaded ${Object.keys(this.recipes).length} crafting recipes`);
        } catch (error) {
            console.error('Failed to load crafting recipes:', error);
            this.createDefaultRecipes();
        }
    }

    createDefaultRecipes() {
        // Fallback recipes if JSON fails to load
        this.recipes = {
            craftedChair: {
                id: 'craftedChair',
                name: 'Wooden Chair',
                icon: '🪑',
                materials: { wood: 5 },
                result: { item: 'chair', quantity: 1 },
                unlocked: true,
                category: 'furniture'
            },
            betterHoe: {
                id: 'betterHoe',
                name: 'Quality Hoe',
                icon: '🔨',
                materials: { wood: 10, pebbles: 5 },
                result: { item: 'betterHoe', quantity: 1, bonus: 'Till 3x3 area' },
                unlocked: true,
                category: 'tools'
            },
            sprinkler: {
                id: 'sprinkler',
                name: 'Sprinkler',
                icon: '💧',
                materials: { wood: 15, pebbles: 8 },
                result: { item: 'sprinkler', quantity: 1, bonus: 'Auto-waters 3x3 crops daily' },
                unlocked: true,
                category: 'tools'
            }
        };

        this.unlockedRecipes = ['craftedChair', 'betterHoe', 'sprinkler'];
    }

    openCraftingMenu() {
        this.craftingUI.showing = true;
        this.craftingUI.selectedRecipe = null;
        this.game.uiState.showingMenu = true;
    }

    closeCraftingMenu() {
        this.craftingUI.showing = false;
        this.game.uiState.showingMenu = false;
    }

    hasMaterials(recipeId) {
        const recipe = this.recipes[recipeId];
        if (!recipe) return false;

        for (const [material, amount] of Object.entries(recipe.materials)) {
            const playerAmount = this.game.getInventoryCount(material);
            if (playerAmount < amount) {
                return false;
            }
        }
        return true;
    }

    craftItem(recipeId) {
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

        // Check materials
        if (!this.hasMaterials(recipeId)) {
            this.game.showMessage(`Not enough materials!`);
            return false;
        }

        // Remove materials from inventory
        for (const [material, amount] of Object.entries(recipe.materials)) {
            this.game.removeFromInventory(material, amount);
        }

        // Add crafted item to inventory
        const craftedItem = {
            id: recipe.result.item,
            name: recipe.name,
            icon: recipe.icon,
            type: 'crafted',
            bonus: recipe.result.bonus || null
        };

        for (let i = 0; i < (recipe.result.quantity || 1); i++) {
            this.game.addToInventory(craftedItem);
        }

        this.game.showMessage(`Crafted ${recipe.name}!${recipe.result.bonus ? ' ' + recipe.result.bonus : ''}`);

        // Small energy cost for crafting
        this.game.player.energy = Math.max(0, this.game.player.energy - 5);

        return true;
    }

    unlockRecipe(recipeId) {
        if (!this.unlockedRecipes.includes(recipeId)) {
            this.unlockedRecipes.push(recipeId);
            const recipe = this.recipes[recipeId];
            if (recipe) {
                this.game.showMessage(`New crafting recipe learned: ${recipe.name}!`);
            }
        }
    }

    renderCraftingUI(ctx) {
        if (!this.craftingUI.showing) return;

        const width = 650;
        const height = 550;
        const x = (this.game.canvas.width - width) / 2;
        const y = (this.game.canvas.height - height) / 2;

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        // Menu background
        ctx.fillStyle = '#3a2618';
        ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, width, height);

        // Title
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔨 BILL\'S CARPENTER SHOP 🔨', x + width / 2, y + 40);

        // Subtitle
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.fillText('Available from Day 1! Craft furniture and tools', x + width / 2, y + 70);

        // Your materials
        ctx.textAlign = 'left';
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('Your Materials:', x + 20, y + 100);
        ctx.font = '16px Arial';
        ctx.fillStyle = '#FFFFFF';
        const wood = this.game.getInventoryCount('wood') || 0;
        const pebbles = this.game.getInventoryCount('pebbles') || 0;
        const copper = this.game.getInventoryCount('copperOre') || 0;
        const iron = this.game.getInventoryCount('ironOre') || 0;
        ctx.fillText(`🪵 Wood: ${wood}  🪨 Pebbles: ${pebbles}  🔶 Copper: ${copper}  ⚙️ Iron: ${iron}`, x + 20, y + 125);

        // Category tabs
        const categories = ['furniture', 'tools', 'farmEquipment', 'decorations'];
        const tabWidth = 150;
        let tabX = x + 20;
        for (const cat of categories) {
            const isActive = this.craftingUI.category === cat;
            ctx.fillStyle = isActive ? '#8B4513' : '#5c3a1f';
            ctx.fillRect(tabX, y + 140, tabWidth, 30);
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.strokeRect(tabX, y + 140, tabWidth, 30);
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(cat.charAt(0).toUpperCase() + cat.slice(1), tabX + tabWidth / 2, y + 160);
            tabX += tabWidth + 5;
        }

        // List unlocked recipes in selected category
        ctx.textAlign = 'left';
        ctx.font = '18px Arial';
        let yOffset = y + 190;
        let recipeCount = 0;

        if (!this.craftingUI.recipeBoxes) this.craftingUI.recipeBoxes = [];
        this.craftingUI.recipeBoxes = [];

        for (const recipeId of this.unlockedRecipes) {
            const recipe = this.recipes[recipeId];
            if (!recipe || recipe.category !== this.craftingUI.category) continue;

            const hasMats = this.hasMaterials(recipeId);

            // Recipe box
            ctx.fillStyle = hasMats ? '#1a3d5c' : '#5c1a1a';
            ctx.fillRect(x + 20, yOffset - 25, width - 40, 55);
            ctx.strokeStyle = hasMats ? '#3d6d8f' : '#8f2d2d';
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 20, yOffset - 25, width - 40, 55);

            // Recipe name and icon
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(`${recipe.icon} ${recipe.name}`, x + 40, yOffset);

            // Materials needed
            ctx.font = '14px Arial';
            ctx.fillStyle = '#CCCCCC';
            let matsText = 'Need: ';
            for (const [mat, amt] of Object.entries(recipe.materials)) {
                const playerAmt = this.game.getInventoryCount(mat);
                matsText += `${mat}(${playerAmt}/${amt}) `;
            }
            ctx.fillText(matsText, x + 40, yOffset + 18);

            // Bonus if exists
            if (recipe.result.bonus) {
                ctx.fillStyle = '#90EE90';
                ctx.font = 'italic 12px Arial';
                ctx.fillText(`✨ ${recipe.result.bonus}`, x + 40, yOffset + 33);
            }

            // Click area
            const recipeBox = {
                x: x + 20,
                y: yOffset - 25,
                width: width - 40,
                height: 55,
                recipeId: recipeId
            };
            this.craftingUI.recipeBoxes.push(recipeBox);

            yOffset += 65;
            recipeCount++;

            if (yOffset > y + height - 80) break; // Don't overflow
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

        this.craftingUI.closeButton = {
            x: x + width - 120,
            y: y + height - 50,
            width: 100,
            height: 35
        };
    }

    handleClick(mouseX, mouseY) {
        if (!this.craftingUI.showing) return false;

        // Check close button
        if (this.craftingUI.closeButton) {
            const btn = this.craftingUI.closeButton;
            if (mouseX >= btn.x && mouseX <= btn.x + btn.width &&
                mouseY >= btn.y && mouseY <= btn.y + btn.height) {
                this.closeCraftingMenu();
                return true;
            }
        }

        // Check recipe boxes
        if (this.craftingUI.recipeBoxes) {
            for (const box of this.craftingUI.recipeBoxes) {
                if (!box) continue;
                if (mouseX >= box.x && mouseX <= box.x + box.width &&
                    mouseY >= box.y && mouseY <= box.y + box.height) {
                    this.craftItem(box.recipeId);
                    return true;
                }
            }
        }

        return false;
    }
}
