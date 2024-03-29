import { componentNames } from "./names.js";

export class VaeFilePicker extends HTMLElement {
    static observedAttributes = [
        "label", "name", "button-label", "accept"
    ];

    // Add that this is a form associated element
    static formAssociated = true;

    constructor() {
        super();
        this.createShadowDom();
        
        // Get access to the internal form controls
        this.internals = this.attachInternals();

    }

    initialiseButtonLabel() {
        // Save button label as base label
        this.baseLabel = this.buttonLabel += "\n";
        this.buttonLabel = this.baseLabel += "\u200b";
    }

    createShadowDom() {
        // Create shadow dom 
        const shadow = this.attachShadow({ mode: "open" });

        // Create all the elements associated with a file picker
        const mainLabel = document.createElement("label");
        const descriptorSlot = document.createElement("slot");
        const fileUploader = document.createElement("button");
        const fileInput = document.createElement("input");
        fileInput.type = "file";

        // Store the different elements in our file picker
        this.mainLabel = mainLabel;
        this.descriptorSlot_ = descriptorSlot;
        this.fileUploader = fileUploader;
        this.fileInput = fileInput;

        // Set part attributes on elements so we can theme
        // them outside of the shadow dom
        mainLabel.setAttribute("part", "label");
        descriptorSlot.setAttribute("part", "descriptor");
        fileUploader.setAttribute("part", "uploader");
        fileInput.setAttribute("part", "file-input");

        // Add to our shadow dom
        shadow.appendChild(mainLabel);
        shadow.appendChild(descriptorSlot);
        shadow.appendChild(fileUploader);
        shadow.appendChild(fileInput);
    }

    /**
     * Attribute changed callback to keep attributes set on html
     * in sync with class properties
     */
    attributeChangedCallback(name, _oldValue, newValue) {
        this.initialiseButtonLabel();
        
        // kebab to camel case
        let camelName = name.replace(/-./g, kebabPredicate => kebabPredicate[1].toUpperCase());
        this[camelName] = newValue;
    }

    connectedCallback() {
        // Open file picker callback for user input
        this.fileOpenCallback = this.openFilePicker.bind(this);
        this.fileUploader.addEventListener("click", this.fileOpenCallback);
        
        // Drag and drop handler
        this.fileDropCallback = this.filePickerDropped.bind(this);
        this.fileUploader.addEventListener("drop", this.fileDropCallback)

        this.fileDragCallback = this.fileDragCallback.bind(this);
        this.fileUploader.addEventListener("dragover", this.fileDragCallback);

        // Event for when a file is uploaded
        this.fileInputtedEvent = this.fileUploaded.bind(this);
        this.fileInput.addEventListener("change", this.fileInputtedEvent)
    }

    disconnectedCallback() {
        this.fileUploader.removeEventListener("click", this.fileOpenCallback);
        this.fileUploader.removeEventListener("drop", this.fileDropCallback);
        this.fileInput.removeEventListener("change", this.fileInputtedEvent);
        this.fileUploader.removeEventListener("dragover", this.fileDragCallback);
    }

    /**
     * Handles the case when a file is dropped onto the file picker
     */
    filePickerDropped(event) {
        event.preventDefault();

        if (event.dataTransfer.items) {
            // Get the first element transferred
            const firstTransfer = event.dataTransfer.items[0];

            // If its not a file then ignore
            if (firstTransfer.kind !== "file") {
                return;
            }

            // Set current file
            this.currentFile = firstTransfer.getAsFile();

        } else {
            // Set current file to the first file
            this.currentFile = event.dataTransfer.files[0];
        }
    }

    /**
     * Handles the drag over event for the file picker,
     * to prevent default behaviour
     */
    fileDragCallback(event) {
        // Prevent default behavior (Prevent file from being opened)
        event.preventDefault();
    }
      

    /**
     * Handles the click for file clicker case for the file picker
     */
    openFilePicker() {
        this.fileInput.click();
    }

    /**
     * Handles the uploaded file case
     */
    fileUploaded() {
        // Only accept the first file
        this.currentFile = this.fileInput.files[0];
    }

    /**
     * Getters and setters for shadoww dom elements
     */
    set label(label)    { this.label_ = label; this.mainLabel.textContent = label; }
    get label()         { return this.label_; }

    // Button label setting (the upload/drop label)
    set buttonLabel(label) { 
        let newLabel = `${label}`;

        if (this.currentFile) {
            newLabel += `${this.currentFile.name}`;
        }

        this.fileUploader.textContent = newLabel;
    }
    get buttonLabel()      { return this.fileUploader.textContent;  }

    set accept(accept) { this.fileInput.accept = accept; }
    get accept()       { return this.fileInput.accept; }

    /**
     * File submission getter/setter for interface with form.
     */
    set currentFile(file) {
        // Set internal version to keep it inside
        this.currentFile_ = file;

        // Update button label
        this.buttonLabel = this.baseLabel;

        // Update form with this file.
        this.internals.setFormValue(file);
    }

    get currentFile() {
        return this.currentFile_;
    }

    /**
    * Some parity getters/setters with normal browser components
    */
    get form() { return this.internals.form; }
}

customElements.define(componentNames.filePicker, VaeFilePicker);