import { componentNames } from "./names.js";

/**
 * Layering system to seperate contained and base elements 
 */
export class VaeLayer extends HTMLElement {
    /**
     * Different types of layers capable of being used
     */
    static ALLOWED_TYPES = {
        BASE: "base",
    }

    constructor() { 
        super();
    }

    connectedCallback() {
        // Set default value for type of this layer to base
        if (!this.getAttribute("type")) {
            this.setAttribute(
                "type", 
                this.constructor.ALLOWED_TYPES.BASE
            );
        }
    }
}

customElements.define(componentNames.layer, VaeLayer);