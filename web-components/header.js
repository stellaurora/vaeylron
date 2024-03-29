import { componentNames } from "./names.js";

/**
 * Header element for a certain VaeLayer
 */
export class VaeHeader extends HTMLElement {
    constructor() {
        super();
    }
}

customElements.define(componentNames.header, VaeHeader);
