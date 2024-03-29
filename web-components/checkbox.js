import { componentNames, ALLOWED_THEMES } from "./names.js";

/**
 * A checkbox style input option
 */
export class VaeCheckBox extends HTMLElement {
    static observedAttributes = [
        "name", "icon", "unchecked"
    ];

    // Add that this is a form associated element
    static formAssociated = true;

    constructor() {
        super();
        this.createShadowDom();

        // Get access to the internal form controls
        this.internals = this.attachInternals();
    }

    createShadowDom() {
        // Create shadow root element and attach it to the checkbox
        const shadow = this.attachShadow({ mode: "open" });

        // Create the actual button itself
        const button = document.createElement("button");
        const textSlot = document.createElement("slot");

        // Save elements as properties so we dont have to refetch
        this.button_ = button;
        this.slot_ = textSlot;

        // Add part attributes so we can theme these elements
        button.setAttribute("part", "button");
        button.appendChild(textSlot);

        shadow.appendChild(button);
    }

    /**
     * Toggles the checked state of this checkbox
     */
    toggleCheckbox() {
        this.checked = !this.checked;
    }

    connectedCallback() {
        // Callback function for this method (store here so we can remove event listener later)
        this.checkCallback_ = () => this.toggleCheckbox();

        // Add an event listener to toggle this checkbox
        // (Avoiding default css checkbox because theming it is... interesting)
        this.button_.addEventListener("click", this.checkCallback_);

        // Set default button style to primary if unspecified
        if (!(this.theme)) {
            this.theme = ALLOWED_THEMES.PRIMARY;
        }

        if (!(this.icon)) {
            this.icon = `✓`;
        }

        // Set default form value to false (unchecked)
        this.internals.setFormValue(false);
    }

    disconnectedCallback() {
        // Cleanup event listeners
        this.button_.removeEventListener("click", this.checkCallback_);
    }


    /**
     * Attribute changed callback to keep attributes set on html
     * in sync with class properties
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        this[name] = newValue;
    }
    
    /**
     * Reflection of attributes/properties
     */
    get checked()        { return this.getAttribute("checked") !== null; }

    set checked(checked) { 
        if (checked) {
            this.setAttribute("checked", checked);
        } else {
            this.removeAttribute("checked");
        }

        this.internals.setFormValue(this.checked);
    }

    // Reflect theme property to attribute for styling purposes
    get theme()      { return this.getAttribute("theme")  }
    set theme(theme) { this.setAttribute("theme", theme); }

    get icon()       { return this.button_.getAttribute("icon") }
    set icon(icon)   { this.button_.setAttribute("icon", icon); }

    // Disabled toggle which makes the element uninteractable with
    get disabled()          { return this.getAttribute("disabled") }
    set disabled(disabled)  { 
        if (disabled) {
            this.setAttribute("disabled", disabled);
        } else {
            this.removeAttribute("disabled");
        }
     }

    // More customisable states
    get unchecked()       { return this.button_.getAttribute("unchecked") }
    set unchecked(icon)   { this.button_.setAttribute("unchecked", icon); }
    
    /**
    * Some parity getters/setters with normal browser components
    */
    get form() { return this.internals.form; }
}

customElements.define(componentNames.checkBox, VaeCheckBox);