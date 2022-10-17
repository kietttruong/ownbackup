import { LightningElement } from 'lwc';

export default class Tile extends LightningElement {
    
    // Handle what happens when the tile is clicked
    handleTileClick() {

        // Kick off a tile click 
        // event to be handled by the parent
        const event = new CustomEvent('tileclick', {

        });

        this.dispatchEvent(event);
    }
}