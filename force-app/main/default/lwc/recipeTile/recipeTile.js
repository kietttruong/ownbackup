import { api, LightningElement, wire } from 'lwc';
import resource from '@salesforce/resourceUrl/DefaultImage';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';
import REACTION_OBJECT from '@salesforce/schema/Reaction__c';
import REACTION_USER from '@salesforce/schema/Reaction__c.User__c';
import REACTION_RECIPE from '@salesforce/schema/Reaction__c.Recipe__c';
import REACTION_RECORDTYPE from '@salesforce/schema/Reaction__c.RecordTypeId';
import userID from '@salesforce/user/Id';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import createReactionRecord from '@salesforce/apex/RecipeController.createReactionRecord'
import removeReactionRecords from '@salesforce/apex/RecipeController.removeReactionRecords'

export default class RecipeTile extends LightningElement {
    @api recipeid; 
    @api title = 'Name';
    @api subtitle = 'Short Description';
    @api imgsrc = `${resource}`;
    @api imageAlt = 'default image'
    @wire(getObjectInfo, {objectApiName: REACTION_OBJECT})
    reactionInfo;

    // Handle the tile click event from the tile
    // and dispatch the recipe tile click 
    // so that the parent component can handle it. 
    handleRecipeTileClick() {
        console.log('this is imgsrc:', this.imgsrc);
        const event = new CustomEvent('recipetileclick', {
            detail: {
                    recipeid: this.recipeid,
                    imgsrc: this.imgsrc
            }
        });

        this.dispatchEvent(event);
    }


    // Handle what happens when the 
    // subscribe button is clicked. 
    handleSubClick() {

        createReactionRecord({reactionRecordType: 'Subscribe', recipeId: this.recipeid, userId: userID})
            .then(response => {
                if (response == true) {
                    // Show the successful toast
                    const event = new ShowToastEvent({
                        title: 'Subscribed!',
                        message:
                            'You are subscribed this recipe! ',
                        variant: "success"
                    });
                    this.dispatchEvent(event);
                } else {
                    // Show the successful toast
                    const event = new ShowToastEvent({
                        title: 'Already Subscribed',
                        message:
                            'You are alredy subscribed this recipe! ',
                        variant: "error"
                    });
                    this.dispatchEvent(event);
                }
            })
            .catch(error => {
                // code to execute if create operation is not successful
                this.displayErrorToast(error);
            });
    }

    // Handle what happens when the 
    // like button is clicked. 
    handleLikeClick() {
        removeReactionRecords({reactionRecordType: 'Dislike', recipeId: this.recipeid, userId: userID})
        .then(response => {

        })
        .catch(error => {
            // code to execute if create operation is not successful
            this.displayErrorToast(error);
        });

        createReactionRecord({reactionRecordType: 'Like', recipeId: this.recipeid, userId: userID})
        .then(response => {
            if (response == true) {
                // Show the successful toast
                const event = new ShowToastEvent({
                    title: 'Liked!',
                    message:
                        'You liked this recipe! ',
                    variant: "success"
                });
                this.dispatchEvent(event);
            } else {
                // Show the successful toast
                const event = new ShowToastEvent({
                    title: 'Already liked',
                    message:
                        'You are alredy like this recipe! ',
                    variant: "error"
                });
                this.dispatchEvent(event);
            }
        })
        .catch(error => {
            // code to execute if create operation is not successful
            this.displayErrorToast(error);
        });
    }

    handleUnsubClick() {
        removeReactionRecords({reactionRecordType: 'Subscribe', recipeId: this.recipeid, userId: userID})
        .then(response => {
            if (response == true) {
                // Show the successful toast
                const event = new ShowToastEvent({
                    title: 'Unsubscribed',
                    message:
                        'You unsubscribed from this recipe! ',
                    variant: "success"
                });
                this.dispatchEvent(event);
            } else {
                // Show the successful toast
                const event = new ShowToastEvent({
                    title: 'You were not subscribed to this recipe before',
                    message:
                        'You were not subscribed previously! ',
                    variant: "error"
                });
                this.dispatchEvent(event);
            }
        })
        .catch(error => {
            // code to execute if create operation is not successful
            this.displayErrorToast(error);
        });
    }

    handleDislikeClick() {
        removeReactionRecords({reactionRecordType: 'Like', recipeId: this.recipeid, userId: userID})
        .then(response => {

        })
        .catch(error => {
            // code to execute if create operation is not successful
            this.displayErrorToast(error);
        });

        createReactionRecord({reactionRecordType: 'Dislike', recipeId: this.recipeid, userId: userID})
            .then(response => {
                if (response == true) {
                    // Show the successful toast
                    const event = new ShowToastEvent({
                        title: 'Disliked',
                        message:
                            'You disliked this recipe! ',
                        variant: "success"
                    });
                    this.dispatchEvent(event);
                } else {
                    // Show the error toast
                    const event = new ShowToastEvent({
                        title: 'Already Disliked',
                        message:
                            'You already dislike this recipe! ',
                        variant: "error"
                    });
                    this.dispatchEvent(event);
                }
            })
            .catch(error => {
                // code to execute if create operation is not successful
                this.displayErrorToast(error);
            });
    }

    // Helper method
    // To show the error toast
    displayErrorToast(error) {
        const event = new ShowToastEvent({
            title: 'Error',
            message:
                'An error occurred while subscribing or liking a recipe ',
            variant: "error"
        });

        console.error("error", error);
        this.dispatchEvent(event);
    }
}