import { componentNames } from "./names.js";

/**
 * Input element for text entry with form support
 */
export class VaeDropdown extends HTMLElement {
    static observedAttributes = [
        "label", "name", "placeholder", "selected"
    ];

    // Add that this is a form associated element
    static formAssociated = true;

    constructor() {
        super();
        this.createShadowDom();
        
        // Get access to the internal form controls
        this.internals = this.attachInternals();

        // Dropdown values and their event listeners
        this.displayValues = [];
        this.eventListeners = [];
        this.values = [];
    }

    /**
     * Creates the shadow DOM used by the vae-text-input component
     */
    createShadowDom() {
        // Create shadow dom for this dropdown with the
        // VaeDropdown element as root
        const shadow = this.attachShadow({ mode: "open" });

        const mainLabel = document.createElement("label");
        const dropdown = document.createElement("button");
        const dropdownElemSlot = document.createElement("slot");

        // Store the different elements in our dropdown for later use
        this.mainLabel = mainLabel;
        this.dropdown = dropdown;
        this.dropdownElemSlot = dropdownElemSlot;

        // Set part attributes on elements so we can theme
        // outside of shadow dom
        mainLabel.setAttribute("part", "label");
        dropdown.setAttribute("part", "button");
        dropdownElemSlot.setAttribute("part", "slot");

        // Add to our shadow dom
        shadow.appendChild(mainLabel);
        shadow.appendChild(dropdown);
        shadow.appendChild(dropdownElemSlot);
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
     * Connected callback, when element is added to dom,
     * continued setup occurs here
     */
    connectedCallback() {
        this.setDropdownText();
        this.setupDropdownChoices();

        // Add functionality to open drawer on click
        this.dropdownCallback = this.modifyOpenState.bind(this);
        this.dropdown.addEventListener("click", this.dropdownCallback);
    }

    /**
     * When the element is removed from dom, clear a bunch of
     * event listeners
     */
    disconnectedCallback() {
        // Clear event listeners
        this.dropdown.removeEventListener("click", this.dropdownCallback);

        this.eventListeners.forEach(
            ([valueButton, eventListener]) => {
                valueButton.removeEventListener("click", eventListener);
            }
        )
    }

    setupDropdownChoices() {
        // Query for all select choices (vae buttons)
        const choices = this.querySelectorAll("vae-button")
        
        choices.forEach(
            (vaeButtonChoice, index) => {
                // Add our values to the array of values related to
                // the differnet dropdown elements
                this.displayValues.push(vaeButtonChoice.textContent);
                this.values.push(vaeButtonChoice.value);

                // Get the value and make the callback for this select
                const eventCallback = () => {
                    this.selected = index;
                    this.setDropdownText();
                    this.modifyOpenState();
                }

                // Save to event listeners for clearing later
                this.eventListeners.push(
                    [vaeButtonChoice, eventCallback]
                );

                // Set the actual event listener now
                vaeButtonChoice.addEventListener("click", eventCallback);
            }
        )
    }

    setDropdownText() {
        if (this.selected_ != undefined) {
            this.dropdown.textContent = this.displayValues[this.selected_];
        } else {
            // Default placeholder if none selected
            this.dropdown.textContent = this.placeholder;
        }
    }

    /**
     * Modifies the current open state, changing it to the next
     * state
     */
    modifyOpenState() {
        this.open = !this.open;
    }

    /**
     * Getters and setters for shadoww dom elements
     */
    set label(label)    { this.label_ = label; this.mainLabel.textContent = label; }
    get label()         { return this.label_; }

    // Open drawer state
    get open()        { return this.getAttribute("open") !== null; }

    set open(open) { 
        if (open) {
            this.setAttribute("open", open);
        } else {
            this.removeAttribute("open");
        }
    }

    get selected()         { return this.selected_; }
    set selected(selected) {
        this.selected_ = selected;
        this.internals.setFormValue(this.values[this.selected]);
        this.setDropdownText();
    }

    /**
    * Some parity getters/setters with normal browser components
    */
    get form() { return this.internals.form; }
}

customElements.define(componentNames.dropdown, VaeDropdown);