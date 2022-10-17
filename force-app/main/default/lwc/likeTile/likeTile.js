import { LightningElement, api } from 'lwc';

import resource from '@salesforce/resourceUrl/DefaultImage';

export default class LikeTile extends LightningElement {
    @api title = 'Name';
    @api imgsrc = `${resource}`;
    @api imageAlt = 'default image';
}