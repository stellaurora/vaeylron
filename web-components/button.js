import { componentNames, ALLOWED_THEMES } from "./names.js";

/**
 * Button element with multiple styles
 */
export class VaeButton extends HTMLElement {
    static observedAttributes = [
        "label", "button-type", "toggle-theme", "toggle-label", 
        "value"
    ];

    // Add that this is a form associated element
    static formAssociated = true;

    // Allowed "styles" types for this button 
    static ALLOWED_THEMES = {
        PRIMARY: "primary",
        SECONDARY: "secondary",
        ERROR: "error",
        SUCCESS: "success"
    };

    // Allowed button types for this button
    static ALLOWED_TYPES = {
        BUTTON: "button",
        SUBMIT: "submit",
        RESET: "reset",
        TOGGLE: "toggle"
    }

    constructor() {
        super();
        this.createShadowDom();
        this.setDefaults();

        // Get access to the internal form controls
        this.internals = this.attachInternals();
    }

    /**
     * Sets properties to default values
     */
    setDefaults() {
        this.buttonType_ = "button";
    }

    /**
     * Creates the shadow DOM used by the vae-button component
     */
    createShadowDom() {
        // Create shadow root element and attach it to the vae-button
        const shadow = this.attachShadow({ mode: "open" });

        // Create the actual button itself
        const button = document.createElement("button");
        const textSlot = document.createElement("slot");
        const toggleSlot = document.createElement("slot");

        // Give it a name so we can slot toggle label
        toggleSlot.name = "toggle-label";

        // Save elements as properties so we dont have to refetch
        this.button_ = button;
        this.slot_ = textSlot;

        // Set part attributes on elements so we can theme
        // outside of shadow dom
        button.setAttribute("part", "button");
        textSlot.setAttribute("part", "label-slot");

        // Add our slots to the button
        button.appendChild(textSlot);

        // Add to our shadow dom
        shadow.appendChild(button);
    }

    /**
     * Connected and disconnected callbacks for the component
     * used for handling clicked even to allow form submit/reset
     * functionality
     */
    connectedCallback() {

        // Store a reference to this function so we can remove
        // event listener later
        this.buttonFunction_ = () => this.handleButtonClick();

        this.button_.addEventListener("click", this.buttonFunction_);

        // Set default button style to primary if unspecified
        if (!(this.theme)) {
            this.theme = ALLOWED_THEMES.PRIMARY;
        }
    }

    disconnectedCallback() {
        this.button_.removeEventListener("click", this.buttonFunction_);
    }

    /**
     * Attribute changed callback to keep attributes set on html
     * in sync with class properties
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        // kebab to camel case
        let camelName = name.replace(/-./g, kebabPredicate => kebabPredicate[1].toUpperCase());
        this[camelName] = newValue;
    }

    /**
     * Theme and label switching on toggle button type
    */
    toggleSwitch() {
        if (this.checked) {

            // Only switch if there is the element
            if (this.toggleLabel) {
                this.textContent = this.toggleLabel;
            }

            if (this.toggleTheme) {
                this.theme = this.toggleTheme;
            }

        } else {
            this.textContent = this.baseLabel_;
            this.theme = this.baseTheme_;
        }
    }

    /**
     * Button handler on press for specific form events to watch
     * out and handle
     */
    handleButtonClick() {
        // Handle the submit, toggle and reset types for our button
        if (this.buttonType_ === this.constructor.ALLOWED_TYPES.SUBMIT) {
            this.form.requestSubmit();

        } else if (this.buttonType_ === this.constructor.ALLOWED_TYPES.RESET) {
            this.form.requestReset();

        } else if (this.buttonType_ === this.constructor.ALLOWED_TYPES.TOGGLE) {
            this.checked = !this.checked;
        }
    }

    // Reflect theme property to attribute for styling purposes
    get theme()             { return this.getAttribute("theme")  }
    set theme(theme)        { this.setAttribute("theme", theme); }

    get ghost()             { return Boolean(this.getAttribute("ghost")); }
    set ghost(ghost)        { this.setAttribute("ghost", ghost);          }

    // Disabled toggle which makes the element uninteractable with
    get disabled()          { return this.getAttribute("disabled"); }
    set disabled(disabled)  { 
        if (disabled) {
            this.setAttribute("disabled", disabled);
        } else {
            this.removeAttribute("disabled");
        }
    }
    

    // Checked properties for toggle type of button
    get checked()        { return this.getAttribute("checked") !== null; }

    set checked(checked) { 
        if (checked) {
            this.setAttribute("checked", checked);
        } else {
            this.removeAttribute("checked");
        }

        // Toggle themes and label and update form value
        this.toggleSwitch();
        this.internals.setFormValue(this.checked);
    }

    get buttonType()     { return this.buttonType_; }
    set buttonType(type) {
        this.buttonType_ = type;

        // If we are setting it to "toggle", save the current 
        // label and theme to swap between
        if (type === this.constructor.ALLOWED_TYPES.TOGGLE) {
            this.baseLabel_ = this.textContent;
            this.baseTheme_ = this.theme;
        }
    }

    /**
    * Some parity getters/setters with normal browser components
    */
    get form() { return this.internals.form; }

}


customElements.define(componentNames.button, VaeButton);


