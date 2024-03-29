import { componentNames } from "./names.js";

/**
 * Input element for text entry with form support
 */
export class VaeTextInput extends HTMLElement {
    static observedAttributes = [
        "name", "state", "label", 
        "helper", "type", "error",
        "size"
    ];

    // Add that this is a form associated element
    static formAssociated = true;

    // States allowed for this input
    static ALLOWED_STATES = {
        ERROR_STATE: "error",
    };

    // Sizes allowed (choice between textArea, Input)
    static ALLOWED_SIZES = {
        LONG: "long",
        SHORT: "short",
    }

    constructor() {
        super();
        this.createShadowDom();
        this.setDefaults();
        
        // Get access to the internal form controls
        this.internals = this.attachInternals();
    }

    /**
     * Sets properties to default
     */
    setDefaults() {
        this.label = "Label";
        this.helper = "\u00A0";
        this.error = "\u00A0";
    }

    /**
     * Creates the shadow DOM used by the vae-text-input component
     */
    createShadowDom() {
        // Create shadow dom for this text input with the
        // VaeTextInput element as root
        const shadow = this.attachShadow({ mode: "open" });

        const mainLabel = document.createElement("label");
        const textInput = document.createElement("input");
        const subLabel = document.createElement("label");

        // Store the different elements in our text input for later use
        this.subLabel = subLabel;
        this.mainLabel = mainLabel;
        this.textInput = textInput;

        // Set part attributes on elements so we can theme
        // outside of shadow dom
        mainLabel.setAttribute("part", "label");
        textInput.setAttribute("part", "input");
        subLabel.setAttribute("part", "sub-label");

        // Add to our shadow dom
        shadow.appendChild(mainLabel);
        shadow.appendChild(textInput);
        shadow.appendChild(subLabel);
    }

    /**
     * Connected and disconnected callbacks for the component
     * used for handling input case to sync to form data
     */
    connectedCallback() {
        // Store callback for removal later
        this.textInputCallback_ = () => this.textInputChanged();

        // Add callbacks for form involvement
        this.textInput.addEventListener("input", this.textInputCallback_);
    }

    disconnectedCallback() {
        this.textInput.removeEventListener("input", this.textInputCallback_);
    }

    /**
     * Attribute changed callback to keep attributes set on html
     * in sync with class properties
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        this[name] = newValue;
    }

    /**
     * Setter and getter for value so we can "forward" our inputs value
     */
    get value()         { return this.textInput.value; }

    // Set text input changed so we can update the actual form's value
    set value(value)    { 
        this.textInput.value = value; 
        this.textInputChanged(); 
    }

    /**
     * Setters and getters for reflected attributes
     */
    get state()     { return this.state_;  }
    get label()     { return this.label_;  }
    get helper()    { return this.helper_; }
    get error()     { return this.error_;  }
    get type()      { return this.type_;   }
    

    set state(state)    { 
        this.state_    = state;       
        this.subLabelUpdate();   

        // A seperate attribute for styling state which isnt observed
        // but is still reflected from state, for flexibility         
        this.setAttribute("style-state", state);
    }

    //                  Update the internal ver         Update shadow dom 
    set label(label)    { this.label_    = label;       this.mainLabel.textContent = label; }
    set helper(helper)  { this.helper_   = helper;      this.subLabelUpdate();              }
    set error(error)    { this.error_    = error;       this.subLabelUpdate();              }
    set type(type)      { this.type_     = type;        this.textInput.type = type;         }

    /**
     * Some parity getters/setters with normal browser components
     */
    get form() { return this.internals.form; }

    /**
     * Long vs Short version of text input, only applies if set to long from short
     */
    set size(size) {
        if (size === this.constructor.ALLOWED_SIZES.LONG) {
            // Replace with a text area
            const textArea = document.createElement("textarea");
            textArea.setAttribute("part", "input");
            
            this.textInput.replaceWith(textArea)
            this.textInput = textArea;
        }
    }

    /**
     * Methods which are called whenever an attribute changes to modify the
     * current state of the input element
     */
    subLabelUpdate() {
        // Check and update for error state
        if (this.state_ === this.constructor.ALLOWED_STATES.ERROR_STATE) {
            this.subLabel.textContent = this.error_;
        } else {
            this.subLabel.textContent = this.helper_;
        }
    }

    // Disabled toggle which makes the element uninteractable with
    get disabled()          { return this.getAttribute("disabled"); }
    set disabled(disabled)  { 
        if (disabled) {
            this.setAttribute("disabled", disabled);
        } else {
            this.removeAttribute("disabled");
        }
    }

    /**
     * A callback that occurs when the input text inside the
     * shadow dom's input is changed (add new data to form)
     */
    textInputChanged() {
        // Force form data to require a name
        if (this.name) {
            this.internals.setFormValue(this.value);
        }
    }
}

customElements.define(componentNames.textInput, VaeTextInput);