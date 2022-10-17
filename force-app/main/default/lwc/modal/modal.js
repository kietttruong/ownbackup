import { LightningElement, api, track } from 'lwc';

export default class Modal extends LightningElement {
    @api modalTitle = 'Title';
    @track showModal = false;

    @api
    showModalBox() {
        this.showModal = true;
    }

    @api
    hideModalBox() {
        this.showModal = false;
    }
}