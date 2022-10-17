import { api, LightningElement, track } from 'lwc';
import RECIPE_OBJECT from '@salesforce/schema/Recipe__c';
import getReactions from '@salesforce/apex/RecipeController.getReactions';

export default class RecipeDetailModal extends LightningElement {

    @api
    recipeId;

    @api
    recipeName;

    @track
    likes = [];

    @track
    likeCount = 0;

    @track
    imgsrc;

    @api imageAlt = 'default image'

    RECIPE_OBJECT = RECIPE_OBJECT.objectApiName;

    // Query for all the reactions
    @api
    loadReactions(recipeId) {
        // Reset the reaction variables
        this.recipeId = recipeId;
        this.likes = [];
        this.likeCount = 0;

        // Query for all the reactions
        getReactions({recipeId: this.recipeId}) 
            .then(result => {
                // Set the like count for display
                this.likeCount = result.length;

                // Go through each 
                // reaction and create an object
                // which contains the name and ID
                result.forEach(element => {
                    const likeRecord = {
                        name : element.User__r.Name,
                        Id : element.Id,
                        fullphotourl: element.User__r.FullPhotoUrl
                    } 

                    // Add into the likes list
                    this.likes.push(likeRecord);
                });
            })
            .catch(error => {
                this.error = error;
            });
    }

    @api
    openModal(recipeId, imgsrc){
        this.imgsrc = imgsrc;
        this.template.querySelector("c-modal").showModalBox();    
    }

    @api 
    closeModal() {
        this.template.querySelector("c-modal").hideModalBox();
    }
}