import { LightningElement, track } from 'lwc';
import getRecipes from '@salesforce/apex/RecipeController.getRecipes';

export default class RecipeDashboard extends LightningElement {

    @track
    recipes;

    @track
    recipesize;

    error; 

    // Load the recipes as the very first thing
    connectedCallback() {
        this.loadRecipes();
    }

    // Call the apex method to query for recipes
    loadRecipes() {
        getRecipes() 
            .then(result => {
                this.recipesize = result.length;
                this.recipes = result;
            })
            .catch(error => {
                this.error = error;
            })
    }

    // Handle the click event of the 
    // create new recipe button
    handleClickEvent(event) {
        this.template.querySelector("c-create-recipe-modal").openModal();
    }

    // Handle the click event
    // when the tile itself is clicked
    // to show the details. 
    handleRecipeTileClick(event) {
        this.template.querySelector("c-recipe-detail-modal").loadReactions(event.detail.recipeid);
        this.template.querySelector("c-recipe-detail-modal").openModal(event.detail.recipeid, event.detail.imgsrc);
    }

    handleCreateRecipeFinished(event) {
        this.loadRecipes();
    }
}