import { api, LightningElement } from 'lwc';

export default class IconTextButton extends LightningElement {
    @api label = 'Create';
    @api title = 'Create';
    @api iconName = 'action:new';

    // Send the click event so the dashboard 
    // Can handle it
    openCreateRecipeModal() {
        this.dispatchEvent(new CustomEvent("click"));
    }
}