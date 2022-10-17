import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';

import RECIPE_OBJECT from '@salesforce/schema/Recipe__c';
import RECIPE_NAME_FIELD from '@salesforce/schema/Recipe__c.Name';
import RECIPE_DESCRIPTION_FIELD from '@salesforce/schema/Recipe__c.DESCRIPTION__c';
import createContentDocLink from '@salesforce/apex/RecipeController.createContentDocLink';

export default class CreateRecipeModal extends LightningElement {
    // Id of the last file that was uploaded via the file upload
    lastFileUploaded; 

    @api
    openModal(){
        this.template.querySelector("c-modal").showModalBox();
    }

    @api 
    closeModal() {
        this.template.querySelector("c-modal").hideModalBox();
    }

    // Only accept these files for now
    get acceptedUploadFormats() {
        return ['.jpg', '.png', '.jpeg'];
    }

    handleCreateNewRecipe() {

        // Getting all the input elements in an array
        // iterates through every element
        // call each element's report & check validity
        const allValid = [
            this.template.querySelector("lightning-input"),
            this.template.querySelector("lightning-textarea")
        ].reduce((validSoFar, formElement) => {
            formElement.reportValidity();
            return validSoFar && formElement.checkValidity();
        });

        // Get the values from the inputs
        let recipeName = this.template.querySelector("lightning-input").value;
        let descriptionName = this.template.querySelector("lightning-textarea").value;
        
        // Create the record object to insert
        const recordInput = {
            apiName: RECIPE_OBJECT.objectApiName,
            fields: {
                [RECIPE_NAME_FIELD.fieldApiName] : recipeName,
                [RECIPE_DESCRIPTION_FIELD.fieldApiName] : descriptionName
            }
        };

        // Create the new recipe record
        createRecord(recordInput)
            .then(recipe => {

                // After the recipe is created,
                // Create the content doc link
                // which links the file to the recipe
                if (this.lastFileUploaded != null) {

                    createContentDocLink({fileId: this.lastFileUploaded, recipeId: recipe.id})
                        .then(result => {
                            
                        })
                        .catch(error => {
                            this.displayErrorToast(error);
                        })
                }
                
                    // Kick off a tile click 
                    // event to be handled by the parent
                    const finishedEvent = new CustomEvent('createfinished', {

                    });

                    this.dispatchEvent(finishedEvent);

                // Show the successful toast
                const event = new ShowToastEvent({
                    title: 'Success',
                    message:
                        'Your Recipe was created. ',
                    variant: "success"
                });
                this.dispatchEvent(event);


                this.closeModal();
            })
            .catch(error => {
                // code to execute if create operation is not successful
                this.displayErrorToast(error);
            });
    }

    // Helper method to display the error toast
    displayErrorToast(error) {
        const event = new ShowToastEvent({
            title: 'Error',
            message:
                'Your Recipe was not created. ',
            variant: "error"
        });

        
        this.dispatchEvent(event);
    }

    // After the file is uploaded, keep track
    // of the file's ID for use later. 
    handleUploadFinished(event) {
        const uploadedFiles = event.detail.files;
        this.lastFileUploaded = event.detail.files[0].documentId;
    }
}