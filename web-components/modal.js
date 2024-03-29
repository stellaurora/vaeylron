import { componentNames, ALLOWED_THEMES } from "./names.js";

/**
 * Modal popup which occupies entire screen with a layer in the middle
 */
export class VaeModel extends HTMLElement {
    static observedAttributes = [
        "title", "header", "icon", "alt"
    ];

    constructor() {
        super();
        this.createElements();
    }

    createElements() {
        // Add title elements to the modal for our modal
        const modalTitle = document.createElement("h1");
        const modalHeader = document.createElement("h4");

        // Add theming class to the header and title
        modalHeader.classList.add("modal-header");
        modalTitle.classList.add("modal-title");

        // Add image element
        const icon = document.createElement("img");
        icon.classList.add("modal-icon");

        // Save the elements
        this.title_ = modalTitle;
        this.header_ = modalHeader;
        this.icon_ = icon;
    }

    modalDismissClicked(event) {
        // Make sure the target of the click
        // is this node and not a child
        if (event.target.isSameNode(this)) {
            this.hide();
        }
    }

    connectedCallback() {
        // Store the callback for the dismiss event function for clearing later
        this.dismissCallback_ = (event) => this.modalDismissClicked(event);

        // Click event for when click outside bounds of inner layer
        // which dismisses the modal
        this.addEventListener("click", this.dismissCallback_);
        
        // Hook into the layer which should exist
        // under this modal
        const layer = this.querySelector(`${componentNames.layer}`);
        if (layer) {
            this.hookInLayer(layer);

            // Store callback for removal later
            this.exitButtonCallback_ = () => this.hide();
            this.exitButton.addEventListener("click", this.exitButtonCallback_);
        }
    }

    disconnectedCallback() {
        // Disconnect our event listeners
        this.removeEventListener("click", this.dismissCallback_);
        
        if (this.exitButton) {
            this.exitButton.removeEventListener("click", this.exitButtonCallback_);
        }
    }

    /**
     * Attribute changed callback to keep attributes set on html
     * in sync with class properties
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        this[name] = newValue;
    }

    /**
     * Hooks into a layer adding a close button for
     * the surrounding modal
     * @param {VaeLayer} layer 
     */
    hookInLayer(layer) {
        // Add a class to our layer to help theme it
        layer.classList.add("modal-layer");

        // Create our exit button
        const exitButton = document.createElement(`${componentNames.button}`);
        exitButton.textContent = "✖"

        // Add to part for style purposes
        exitButton.classList.add("modal-close");

        // Set default button style to ghost secondary
        exitButton.button = ALLOWED_THEMES.SECONDARY;
        exitButton.ghost = true;

        layer.appendChild(exitButton);
        this.exitButton = exitButton;

        // Create wrapper elements for theming purposes
        const headerWrapper = document.createElement("section");
        const headerTextWrapper = document.createElement("div");

        // Theming classes
        headerWrapper.classList.add("modal-header-wrapper");
        headerTextWrapper.classList.add("modal-header-text-wrapper");

        // Append out children to it    
        headerWrapper.append(this.icon_, headerTextWrapper);
        headerTextWrapper.append(this.header_, this.title_);

        // Add our prior title and header and icon
        layer.prepend(headerWrapper);
    }

    /**
     * Setters and getters for the title, icon and header element
     */
    set title(title)    { this.title_.textContent = title;   }
    set header(header)  { this.header_.textContent = header; }
    set icon(icon)      { this.icon_.src = icon;             }
    set alt(text)       { this.icon_.alt = text;             }

    get title()  { return this.title_.textContent;  }
    get header() { return this.header_.textContent; }
    get icon()   { return this.icon_.src;           }
    get alt()    { return this.icon_.alt;           }

    show() {
        // Dispatch the show event and add show element
        // for style
        const showEvent = new Event("show");

        this.dispatchEvent(showEvent);
        this.setAttribute("show", "");
    }

    hide() {
        const hideEvent = new Event("hide");

        // Dispatch the hide event and remove show
        this.dispatchEvent(hideEvent);
        this.removeAttribute("show");
    }
}

customElements.define(componentNames.modal, VaeModel);